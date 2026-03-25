import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Skill } from "../backend.d.ts";
import SkillCard from "../components/SkillCard";
import { createActorWithConfig } from "../config";

const HOW_IT_WORKS = [
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: "List Your Skills",
    desc: "Tell the community what you can teach and what you'd love to learn in return.",
  },
  {
    icon: <Search className="w-7 h-7" />,
    title: "Find a Match",
    desc: "Browse hundreds of skills across categories and discover your perfect exchange partner.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Exchange & Grow",
    desc: "Connect, schedule, and start exchanging knowledge — no money needed, just commitment.",
  },
];

const PROFILE_CARDS = [
  {
    name: "Aisha Patel",
    teaches: "Yoga & Mindfulness",
    wants: "Web Development",
    exchanges: 14,
    initials: "AP",
    color: "bg-purple-500",
  },
  {
    name: "Marcus Chen",
    teaches: "React & TypeScript",
    wants: "Spanish Language",
    exchanges: 22,
    initials: "MC",
    color: "bg-blue-600",
  },
];

const BG_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: `dot-${i}`,
  w: `${(i * 37 + 50) % 200}px`,
  h: `${(i * 41 + 50) % 200}px`,
  top: `${(i * 31) % 100}%`,
  left: `${(i * 43) % 100}%`,
  opacity: (i * 0.03) % 0.3,
}));

const LOADING_KEYS = ["ld-a", "ld-b", "ld-c", "ld-d"];

export default function HomePage() {
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const backend = await createActorWithConfig();
        let skills: Skill[];

        if (!localStorage.getItem("sampleDataLoaded")) {
          const result = await backend.populateSampleData();
          skills = result.sampleSkills;
          localStorage.setItem("sampleDataLoaded", "true");
        } else {
          skills = await backend.listSkills();
        }
        setFeaturedSkills(skills.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {BG_DOTS.map((dot) => (
            <div
              key={dot.id}
              className="absolute rounded-full bg-white/20"
              style={{
                width: dot.w,
                height: dot.h,
                top: dot.top,
                left: dot.left,
                opacity: dot.opacity,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>100% free skill exchange</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Learn new skills.
              <br />
              <span className="text-white/80">Teach yours.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
              SkillSwap connects people who want to teach with people who want
              to learn. Exchange knowledge, grow together — no money, just
              passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                asChild
              >
                <Link to="/skills" data-ocid="hero.primary_button">
                  Browse Skills <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
                asChild
              >
                <Link to="/post-skill" data-ocid="hero.secondary_button">
                  Post a Skill
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-14">
              {(
                [
                  ["2,400+", "Skills Listed"],
                  ["1,800+", "Members"],
                  ["950+", "Exchanges Made"],
                ] as const
              ).map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="text-3xl font-extrabold text-white">{n}</div>
                  <div className="text-sm text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search bar */}
      <section className="bg-white border-b border-border py-6">
        <div className="max-w-3xl mx-auto px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/skills", search: { q: searchQuery } });
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Find skills: 'Design', 'Coding', 'Guitar'…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="hero.search_input"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
              data-ocid="hero.submit_button"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Featured Skills
              </h2>
              <p className="text-muted-foreground mt-1">
                Discover what the community is offering
              </p>
            </div>
            <Link
              to="/skills"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              data-ocid="featured.link"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {LOADING_KEYS.map((k) => (
                <div
                  key={k}
                  className="h-72 bg-card border border-border rounded-xl animate-pulse"
                  data-ocid="featured.loading_state"
                />
              ))}
            </div>
          ) : featuredSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredSkills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  data-ocid={`featured.item.${i + 1}`}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="featured.empty_state"
            >
              No skills found. Be the first to post!
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Three simple steps to start exchanging skills with people around
              the world.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center px-6"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-4xl font-extrabold text-primary/20 mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile promo */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Real people, real knowledge exchange
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Join thousands of learners and teachers who've discovered that
                the best currency is knowledge itself. Build meaningful
                connections while leveling up your skills.
              </p>
              <div className="flex gap-3">
                <Button className="bg-primary text-primary-foreground" asChild>
                  <Link to="/register" data-ocid="promo.primary_button">
                    Join SkillSwap Free
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/skills" data-ocid="promo.secondary_button">
                    Browse Skills
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROFILE_CARDS.map((p) => (
                <div
                  key={p.name}
                  className="bg-card border border-border rounded-xl p-5 shadow-card"
                  data-ocid="promo.card"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.exchanges} exchanges
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary">Teaches:</span>{" "}
                      {p.teaches}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary">Wants:</span>{" "}
                      {p.wants}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
