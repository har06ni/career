import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/public/Landing";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";

import StudentDashboard from "@/pages/student/Dashboard";
import StudentProfile from "@/pages/student/Profile";
import AIAnalysis from "@/pages/student/AIAnalysis";
import JobsMarketplace from "@/pages/student/Jobs";
import Courses from "@/pages/student/Courses";
import Mentors from "@/pages/student/Mentors";

import CompanyDashboard from "@/pages/company/Dashboard";
import CompanyJobs from "@/pages/company/Jobs";
import CompanyCandidates from "@/pages/company/Candidates";
import CompanyApplications from "@/pages/company/Applications";
import CompanyProfile from "@/pages/company/Profile";

import MentorDashboard from "@/pages/mentor/Dashboard";
import MentorSessions from "@/pages/mentor/Sessions";
import MentorProfile from "@/pages/mentor/Profile";

import StudentSettings from "@/pages/student/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder components
function Placeholder({ title }: { title: string }) {
  return <div className="p-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground mt-2">This page is under construction.</p>
  </div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Student Routes */}
      <Route path="/student/*">
        <ProtectedRoute allowedRoles={["student"]}>
          <AppLayout>
            <Switch>
              <Route path="/student/dashboard" component={StudentDashboard} />
              <Route path="/student/profile" component={StudentProfile} />
              <Route path="/student/ai" component={AIAnalysis} />
              <Route path="/student/jobs" component={JobsMarketplace} />
              <Route path="/student/courses" component={Courses} />
              <Route path="/student/mentors" component={Mentors} />
              <Route path="/student/settings" component={StudentSettings} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Company Routes */}
      <Route path="/company/*">
        <ProtectedRoute allowedRoles={["company"]}>
          <AppLayout>
            <Switch>
              <Route path="/company/dashboard" component={CompanyDashboard} />
              <Route path="/company/jobs" component={CompanyJobs} />
              <Route path="/company/candidates" component={CompanyCandidates} />
              <Route path="/company/applications" component={CompanyApplications} />
              <Route path="/company/profile" component={CompanyProfile} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Mentor Routes */}
      <Route path="/mentor/*">
        <ProtectedRoute allowedRoles={["mentor"]}>
          <AppLayout>
            <Switch>
              <Route path="/mentor/dashboard" component={MentorDashboard} />
              <Route path="/mentor/sessions" component={MentorSessions} />
              <Route path="/mentor/profile" component={MentorProfile} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
