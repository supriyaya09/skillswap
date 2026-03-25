import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Loader2,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useUser } from "../context/UserContext";
import {
  useDeleteSkill,
  useDeleteUser,
  useListSkills,
  useListUsers,
  usePromoteToAdmin,
  useSetSkillStatus,
} from "../hooks/useQueries";

export default function AdminPanel() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "skill";
    id: string;
  } | null>(null);

  const { data: users, isLoading: usersLoading } = useListUsers();
  const { data: skills, isLoading: skillsLoading } = useListSkills();
  const deleteUser = useDeleteUser();
  const deleteSkill = useDeleteSkill();
  const setSkillStatus = useSetSkillStatus();
  const promoteToAdmin = usePromoteToAdmin();

  useEffect(() => {
    const check = async () => {
      if (!currentUser) {
        navigate({ to: "/login" });
        return;
      }
      try {
        const backend = await createActorWithConfig();
        const admin = await backend.isCallerAdmin();
        if (!admin) {
          navigate({ to: "/" });
          return;
        }
        setIsAdminUser(true);
      } catch {
        navigate({ to: "/" });
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [currentUser, navigate]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "user") {
        await deleteUser.mutateAsync(deleteTarget.id);
        toast.success("User deleted");
      } else {
        await deleteSkill.mutateAsync(deleteTarget.id);
        toast.success("Skill deleted");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (checking) {
    return (
      <main
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAdminUser) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage users and skill listings
            </p>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" data-ocid="admin.tab">
              Users ({users?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="skills" data-ocid="admin.tab">
              Skills ({skills?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {usersLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u, i) => (
                      <TableRow key={u.id} data-ocid={`admin.item.${i + 1}`}>
                        <TableCell className="font-medium">
                          {u.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === "admin" ? "default" : "secondary"
                            }
                            className={
                              u.role === "admin"
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(
                            Number(u.createdAt) / 1_000_000,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={async () => {
                                  await promoteToAdmin.mutateAsync(u.id);
                                  toast.success(
                                    `${u.username} promoted to admin`,
                                  );
                                }}
                                data-ocid="admin.button"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Promote
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({ type: "user", id: u.id })
                              }
                              data-ocid="admin.delete_button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!users || users.length === 0) && (
                  <div
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="admin.empty_state"
                  >
                    No users found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills">
            {skillsLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills?.map((s, i) => (
                      <TableRow key={s.id} data-ocid={`admin.item.${i + 1}`}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {s.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.authorName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.status === "active" ? "default" : "secondary"
                            }
                            className={
                              s.status === "active"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : ""
                            }
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={async () => {
                                const ns =
                                  s.status === "active" ? "inactive" : "active";
                                await setSkillStatus.mutateAsync({
                                  id: s.id,
                                  status: ns,
                                });
                                toast.success(`Skill marked as ${ns}`);
                              }}
                              data-ocid="admin.toggle"
                            >
                              {s.status === "active" ? (
                                <ToggleRight className="w-3.5 h-3.5" />
                              ) : (
                                <ToggleLeft className="w-3.5 h-3.5" />
                              )}
                              {s.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({ type: "skill", id: s.id })
                              }
                              data-ocid="admin.delete_button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!skills || skills.length === 0) && (
                  <div
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="admin.empty_state"
                  >
                    No skills found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
