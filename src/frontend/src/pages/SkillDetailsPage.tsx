import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRightLeft,
  BookOpen,
  Calendar,
  Loader2,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useUser } from "../context/UserContext";
import { useSendRequest, useSkillById } from "../hooks/useQueries";

export default function SkillDetailsPage() {
  const { id } = useParams({ from: "/skills/$id" });
  const { data: skill, isLoading } = useSkillById(id);
  const { currentUser } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sendRequest = useSendRequest();

  const handleSendRequest = async () => {
    if (!currentUser || !skill) return;
    if (!message.trim()) {
      toast.error("Please add a message");
      return;
    }
    try {
      await sendRequest.mutateAsync({
        requesterId: currentUser.id,
        requesterName: currentUser.username,
        providerId: skill.authorId,
        providerName: skill.authorName,
        skillId: skill.id,
        skillTitle: skill.title,
        message: message.trim(),
      });
      const backend = await createActorWithConfig();
      await backend.createNotification(
        skill.authorId,
        "New Exchange Request",
        `${currentUser.username} wants to exchange skills: ${skill.title}`,
        "exchange_request",
        skill.id,
      );
      toast.success("Exchange request sent!");
      setDialogOpen(false);
      setMessage("");
    } catch {
      toast.error("Failed to send request");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          data-ocid="skill.loading_state"
        >
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  if (!skill) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" data-ocid="skill.error_state">
          <h2 className="text-2xl font-bold mb-2">Skill not found</h2>
          <p className="text-muted-foreground mb-4">
            This skill may have been removed.
          </p>
          <Button asChild>
            <Link to="/skills">Browse Skills</Link>
          </Button>
        </div>
      </main>
    );
  }

  const createdDate = new Date(
    Number(skill.createdAt) / 1_000_000,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/skills"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          data-ocid="skill.link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Skills
        </Link>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevated">
          <div className="h-2 bg-primary" />
          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                  {skill.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {skill.title}
                </h1>
              </div>
              {skill.status === "inactive" && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {skill.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">
                    Teaches
                  </span>
                </div>
                <p className="text-base font-medium text-foreground">
                  {skill.offeredSkill}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">
                    Wants in return
                  </span>
                </div>
                <p className="text-base font-medium text-foreground">
                  {skill.wantedSkill}
                </p>
              </div>
            </div>

            {skill.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-8">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {skill.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {skill.authorName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{skill.authorName}</div>
                  <div className="text-xs text-muted-foreground">
                    Instructor
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Posted {createdDate}</span>
              </div>
              <div className="ml-auto">
                {currentUser ? (
                  currentUser.id === skill.authorId ? (
                    <Badge variant="outline">Your listing</Badge>
                  ) : (
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setDialogOpen(true)}
                      data-ocid="skill.primary_button"
                    >
                      Request Exchange
                    </Button>
                  )
                ) : (
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground"
                  >
                    <Link to="/login" data-ocid="skill.primary_button">
                      Log in to Request
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="exchange.dialog">
          <DialogHeader>
            <DialogTitle>Request Skill Exchange</DialogTitle>
            <DialogDescription>
              Send a message to {skill.authorName} about exchanging skills for:{" "}
              {skill.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="exchange-message" className="mb-2 block">
              Your message
            </Label>
            <Textarea
              id="exchange-message"
              placeholder="Introduce yourself and explain what you'd like to exchange…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              data-ocid="exchange.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="exchange.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleSendRequest}
              disabled={sendRequest.isPending}
              data-ocid="exchange.confirm_button"
            >
              {sendRequest.isPending && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
