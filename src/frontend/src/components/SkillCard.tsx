import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRightLeft, BookOpen } from "lucide-react";
import type { Skill } from "../backend.d.ts";

const CATEGORY_COLORS: Record<string, string> = {
  Programming: "bg-blue-100 text-blue-700",
  Design: "bg-purple-100 text-purple-700",
  Music: "bg-pink-100 text-pink-700",
  Language: "bg-green-100 text-green-700",
  Wellness: "bg-teal-100 text-teal-700",
  Culinary: "bg-orange-100 text-orange-700",
  Arts: "bg-red-100 text-red-700",
  Business: "bg-yellow-100 text-yellow-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function SkillCard({ skill }: { skill: Skill }) {
  const catColor = CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS.Other;
  const initials = skill.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card skill-card-hover flex flex-col overflow-hidden">
      <div className="h-2 bg-primary" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColor}`}
          >
            {skill.category}
          </span>
          {skill.status === "inactive" && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
          {skill.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {skill.description}
        </p>

        <div className="bg-secondary/60 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Teaches:</span>
            <span className="font-medium text-foreground truncate">
              {skill.offeredSkill}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Wants:</span>
            <span className="font-medium text-foreground truncate">
              {skill.wantedSkill}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
            {initials}
          </div>
          <span className="text-sm text-muted-foreground truncate">
            {skill.authorName}
          </span>
        </div>

        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skill.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <Link to="/skills/$id" params={{ id: skill.id }}>
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
