import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import { useCreateSkill } from "../hooks/useQueries";

const CATEGORIES = [
  "Programming",
  "Design",
  "Music",
  "Language",
  "Wellness",
  "Culinary",
  "Arts",
  "Business",
  "Other",
];

export default function PostSkillPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const createSkill = useCreateSkill();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    offeredSkill: "",
    wantedSkill: "",
    tags: "",
  });

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Sign in to post a skill</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to list a skill on SkillSwap.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild className="bg-primary text-primary-foreground">
              <Link to="/login" data-ocid="post.primary_button">
                Log In
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register" data-ocid="post.secondary_button">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.category ||
      !form.offeredSkill ||
      !form.wantedSkill
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await createSkill.mutateAsync({
        title: form.title,
        description: form.description,
        category: form.category,
        offeredSkill: form.offeredSkill,
        wantedSkill: form.wantedSkill,
        authorId: currentUser.id,
        authorName: currentUser.username,
        tags,
      });
      toast.success("Skill posted successfully!");
      navigate({ to: "/skills" });
    } catch {
      toast.error("Failed to post skill");
    }
  };

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Post a Skill
        </h1>
        <p className="text-muted-foreground mb-8">
          Share what you can teach and what you'd like to learn in return.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Learn Python from scratch"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-ocid="post.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you'll cover, your experience level…"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              data-ocid="post.textarea"
            />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger data-ocid="post.select">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offered">I will teach *</Label>
              <Input
                id="offered"
                placeholder="e.g., Python, React"
                value={form.offeredSkill}
                onChange={(e) =>
                  setForm({ ...form, offeredSkill: e.target.value })
                }
                data-ocid="post.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wanted">I want to learn *</Label>
              <Input
                id="wanted"
                placeholder="e.g., Spanish, Yoga"
                value={form.wantedSkill}
                onChange={(e) =>
                  setForm({ ...form, wantedSkill: e.target.value })
                }
                data-ocid="post.input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., beginner, online"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              data-ocid="post.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground"
            disabled={createSkill.isPending}
            data-ocid="post.submit_button"
          >
            {createSkill.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Posting…
              </>
            ) : (
              "Post Skill"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
