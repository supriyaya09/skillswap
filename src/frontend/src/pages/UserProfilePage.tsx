import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  BookOpen,
  Clock,
  Edit2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend.d.ts";
import SkillCard from "../components/SkillCard";
import { useUser } from "../context/UserContext";
import {
  useExchangesByUser,
  useListSkills,
  useUpdateProfile,
  useUserById,
} from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

export default function UserProfilePage() {
  const { id } = useParams({ from: "/profile/$id" });
  const { currentUser, setCurrentUser } = useUser();
  const isOwnProfile = currentUser?.id === id;

  const { data: user, isLoading: userLoading } = useUserById(id);
  const { data: allSkills } = useListSkills();
  const { data: exchanges } = useExchangesByUser(id);
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    offeredSkills: "",
    wantedSkills: "",
  });

  const userSkills = allSkills?.filter((s) => s.authorId === id) ?? [];

  const startEditing = () => {
    if (!user) return;
    setEditForm({
      bio: user.bio,
      offeredSkills: user.offeredSkills.join(", "),
      wantedSkills: user.wantedSkills.join(", "),
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    const offeredSkills = editForm.offeredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const wantedSkills = editForm.wantedSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const updated = await updateProfile.mutateAsync({
        id: user.id,
        bio: editForm.bio,
        offeredSkills,
        wantedSkills,
      });
      if (updated && isOwnProfile) setCurrentUser(updated as User);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (userLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div
          className="max-w-4xl mx-auto px-4 py-10"
          data-ocid="profile.loading_state"
        >
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" data-ocid="profile.error_state">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">
                  {user.username}
                </h1>
                {user.role === "admin" && (
                  <Badge className="bg-primary text-primary-foreground">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>

              {editing ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="mb-1 block text-xs">Bio</Label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      rows={3}
                      data-ocid="profile.textarea"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 block text-xs">
                        Skills I offer (comma-separated)
                      </Label>
                      <Input
                        value={editForm.offeredSkills}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            offeredSkills: e.target.value,
                          })
                        }
                        data-ocid="profile.input"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs">
                        Skills I want (comma-separated)
                      </Label>
                      <Input
                        value={editForm.wantedSkills}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            wantedSkills: e.target.value,
                          })
                        }
                        data-ocid="profile.input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      onClick={saveProfile}
                      disabled={updateProfile.isPending}
                      data-ocid="profile.save_button"
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      data-ocid="profile.cancel_button"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    {user.bio || "No bio yet."}
                  </p>
                  {user.offeredSkills.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <BookOpen className="w-4 h-4 text-primary shrink-0" />
                      {user.offeredSkills.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {user.wantedSkills.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
                      {user.wantedSkills.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={startEditing}
                      data-ocid="profile.edit_button"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="skills">
          <TabsList>
            <TabsTrigger value="skills" data-ocid="profile.tab">
              Skills ({userSkills.length})
            </TabsTrigger>
            <TabsTrigger value="exchanges" data-ocid="profile.tab">
              Exchanges ({exchanges?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-6">
            {userSkills.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="profile.empty_state"
              >
                No skills posted yet.
                {isOwnProfile && (
                  <div className="mt-4">
                    <Button
                      asChild
                      className="bg-primary text-primary-foreground"
                    >
                      <Link to="/post-skill" data-ocid="profile.primary_button">
                        Post Your First Skill
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {userSkills.map((skill, i) => (
                  <div key={skill.id} data-ocid={`profile.item.${i + 1}`}>
                    <SkillCard skill={skill} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="exchanges" className="mt-6">
            {!exchanges || exchanges.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="profile.empty_state"
              >
                No exchanges yet.
              </div>
            ) : (
              <div className="space-y-3">
                {exchanges.map((ex, i) => (
                  <div
                    key={ex.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-sm">
                          {ex.skillTitle}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {ex.requesterId === id
                            ? `You → ${ex.providerName}`
                            : `${ex.requesterName} → You`}
                        </div>
                        {ex.message && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            &ldquo;{ex.message}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[ex.status] ?? STATUS_COLORS.pending}`}
                    >
                      {ex.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
