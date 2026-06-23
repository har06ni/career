import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { BarChart, Briefcase, Brain, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation(`/${user.role}/dashboard`);
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart className="h-5 w-5" />
            </div>
            <span>CareerAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Brain className="mr-2 h-4 w-4" />
                  AI-Powered Career Strategist
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Get a tailored path to your <span className="text-primary">career</span>
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  CareerAI analyzes your skills, identifies gaps, and connects you with the right mentors, courses, and jobs to accelerate your career.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Company or Mentor?
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted border p-8 flex flex-col justify-between relative shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-semibold">Career Readiness Score</h3>
                      <p className="text-sm text-muted-foreground">Based on your current profile</p>
                    </div>
                    <div className="text-3xl font-bold text-primary">85%</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Frontend Development</span>
                      <span className="font-medium text-green-600">Strong Match</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted-foreground/20">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>System Design</span>
                      <span className="font-medium text-orange-600">Skill Gap</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted-foreground/20">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="relative mt-8 rounded-xl border bg-background p-4 shadow-sm">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI Recommendation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Take the "Advanced System Architecture" course to boost your match rate for Senior positions by 24%.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-3 w-full">View Course</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to succeed</h2>
              <p className="mt-4 text-lg text-muted-foreground">A complete ecosystem for ambitious professionals.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border bg-background p-8 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">AI Analysis</h3>
                <p className="text-muted-foreground">Get instant feedback on your resume, discover your skill gaps, and receive personalized career path recommendations.</p>
              </div>
              
              <div className="rounded-2xl border bg-background p-8 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">1:1 Mentorship</h3>
                <p className="text-muted-foreground">Connect with industry experts who have been where you want to go. Book sessions and get actionable advice.</p>
              </div>
              
              <div className="rounded-2xl border bg-background p-8 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Smart Job Matching</h3>
                <p className="text-muted-foreground">Stop sending resumes into the void. Apply to jobs where your AI-verified skill match puts you at the top of the pile.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 text-center text-sm text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <BarChart className="h-4 w-4" />
            <span>CareerAI</span>
          </div>
          <p>© {new Date().getFullYear()} CareerAI. Built for ambition.</p>
        </div>
      </footer>
    </div>
  );
}
