import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRightLeft, Bell, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  useMarkAllRead,
  useNotifications,
  useUnreadCount,
} from "../hooks/useQueries";

export default function Header() {
  const { currentUser, logout, isAdmin } = useUser();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadCount } = useUnreadCount(currentUser?.id ?? "");
  const { data: notifications } = useNotifications(currentUser?.id ?? "");
  const markAllRead = useMarkAllRead();

  const unread = unreadCount ? Number(unreadCount) : 0;

  const navLinks = [
    { label: "Browse Skills", to: "/skills" as const },
    { label: "How it Works", to: "/" as const },
    { label: "Community", to: "/skills" as const },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              SkillSwap
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Auth area */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                      data-ocid="nav.button"
                    >
                      <Bell className="w-5 h-5" />
                      {unread > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center leading-none">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 max-h-96 overflow-y-auto"
                    data-ocid="notifications.popover"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                      <span className="font-semibold text-sm">
                        Notifications
                      </span>
                      {unread > 0 && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => markAllRead.mutate(currentUser.id)}
                          data-ocid="notifications.button"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 10).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`px-3 py-2.5 flex flex-col items-start gap-0.5 cursor-default ${!n.isRead ? "bg-accent/40" : ""}`}
                        >
                          <span className="text-sm font-medium">{n.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                        No notifications
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
                      data-ocid="nav.button"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {currentUser.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium hidden sm:block">
                        {currentUser.username}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                    data-ocid="user.dropdown_menu"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile/$id"
                        params={{ id: currentUser.id }}
                        data-ocid="nav.link"
                      >
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/post-skill" data-ocid="nav.link">
                        Post a Skill
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" data-ocid="nav.link">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                      data-ocid="nav.button"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" data-ocid="nav.link">
                    Log In
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link to="/register" data-ocid="nav.primary_button">
                    Get Started
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.button"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            {!currentUser && (
              <div className="flex gap-2 pt-2 px-3">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground"
                  asChild
                >
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
