import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { LogOut, Menu, User, Home, Briefcase, FileText, Settings, BookOpen, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ReactNode } from "react";

const getNavigation = (role: string) => {
  switch (role) {
    case "student":
      return [
        { name: "Dashboard", href: "/student/dashboard", icon: Home },
        { name: "AI Analysis", href: "/student/ai", icon: BarChart },
        { name: "Jobs", href: "/student/jobs", icon: Briefcase },
        { name: "Courses", href: "/student/courses", icon: BookOpen },
        { name: "Mentors", href: "/student/mentors", icon: Users },
        { name: "Profile", href: "/student/profile", icon: User },
      ];
    case "company":
      return [
        { name: "Dashboard", href: "/company/dashboard", icon: Home },
        { name: "Jobs", href: "/company/jobs", icon: Briefcase },
        { name: "Candidates", href: "/company/candidates", icon: Users },
        { name: "Applications", href: "/company/applications", icon: FileText },
        { name: "Profile", href: "/company/profile", icon: Settings },
      ];
    case "mentor":
      return [
        { name: "Dashboard", href: "/mentor/dashboard", icon: Home },
        { name: "Sessions", href: "/mentor/sessions", icon: Users },
        { name: "Profile", href: "/mentor/profile", icon: User },
      ];
    default:
      return [];
  }
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const navigation = getNavigation(user.role);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href={`/${user.role}/dashboard`} className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight">CareerAI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4 text-sm font-medium">
            {navigation.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-3 text-muted-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href={`/${user.role}/dashboard`} className="flex items-center gap-2 text-lg font-semibold mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <BarChart className="h-5 w-5" />
                  </div>
                  CareerAI
                </Link>
                {navigation.map((item) => {
                  const isActive = location.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
