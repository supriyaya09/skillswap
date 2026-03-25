import { Link } from "@tanstack/react-router";
import { ArrowRightLeft } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="footer-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">SkillSwap</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              The peer-to-peer skill exchange platform where knowledge flows
              both ways.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="text-white/60">
                <SiGithub className="w-4 h-4" />
              </span>
              <span className="text-white/60">
                <SiX className="w-4 h-4" />
              </span>
              <span className="text-white/60">
                <SiLinkedin className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Browse Skills", to: "/skills" as const },
                { label: "Post a Skill", to: "/post-skill" as const },
                { label: "How it Works", to: "/" as const },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Categories
            </h4>
            <ul className="space-y-2">
              {["Programming", "Design", "Music", "Language", "Wellness"].map(
                (c) => (
                  <li key={c}>
                    <Link
                      to="/skills"
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {c}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Press"].map((c) => (
                <li key={c}>
                  <span className="text-sm text-white/60">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Support
            </h4>
            <ul className="space-y-2">
              {["Help Center", "Safety", "Privacy", "Terms"].map((c) => (
                <li key={c}>
                  <span className="text-sm text-white/60">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            &copy; {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              className="hover:text-white transition-colors underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
