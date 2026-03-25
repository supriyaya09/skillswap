import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SortOrder } from "../backend";
import type { Skill } from "../backend.d.ts";
import SkillCard from "../components/SkillCard";
import { createActorWithConfig } from "../config";

const CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "Music",
  "Language",
  "Wellness",
  "Culinary",
  "Arts",
  "Business",
];
const SKELETON_KEYS = [
  "sk-a",
  "sk-b",
  "sk-c",
  "sk-d",
  "sk-e",
  "sk-f",
  "sk-g",
  "sk-h",
];

export default function BrowseSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSkills = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    try {
      const backend = await createActorWithConfig();
      let result: Skill[];
      if (q.trim()) {
        result = await backend.searchSkills(q.trim(), SortOrder.desc);
      } else if (cat === "All") {
        result = await backend.listSkills();
      } else {
        result = await backend.listByCategory(cat);
      }
      setSkills(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSkills(category, query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [category, query, fetchSkills]);

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Browse Skills
          </h1>
          <p className="text-muted-foreground">
            Discover skills people are offering and seeking
          </p>

          <div className="mt-6 flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search skills by title, category, or tag…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-ocid="browse.search_input"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="overflow-x-auto pb-2 mb-6">
          <Tabs
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setQuery("");
            }}
          >
            <TabsList className="flex-nowrap inline-flex h-auto gap-1 bg-transparent p-0">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="rounded-full px-4 py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid="browse.tab"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {!loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {skills.length} skill{skills.length !== 1 ? "s" : ""} found
            {category !== "All" ? ` in ${category}` : ""}
            {query ? ` matching "${query}"` : ""}
          </p>
        )}

        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            data-ocid="browse.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <div key={k} className="h-72 rounded-xl overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20" data-ocid="browse.empty_state">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No skills found
            </h3>
            <p className="text-muted-foreground">
              Try a different search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {skills.map((skill, i) => (
              <div key={skill.id} data-ocid={`browse.item.${i + 1}`}>
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
