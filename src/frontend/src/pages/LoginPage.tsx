import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
  const { setCurrentUser } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const backend = await createActorWithConfig();
      const user = await backend.registerUser(
        form.username.trim(),
        form.email.trim(),
        "",
      );
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.username}!`);
      navigate({ to: "/" });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your SkillSwap account
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your_username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
              data-ocid="login.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              data-ocid="login.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
            disabled={loading}
            data-ocid="login.submit_button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
            data-ocid="login.link"
          >
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}
