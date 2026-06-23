import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen, Briefcase, Calendar, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard({
    query: {
      queryKey: getGetStudentDashboardQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here is an overview of your career progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Career Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.careerScore}/100</div>
            <p className="text-xs text-muted-foreground">Based on your profile and activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.profileCompletion}%</div>
            <p className="text-xs text-muted-foreground">Complete it to get better matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.applicationsCount}</div>
            <p className="text-xs text-muted-foreground">Active job applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.sessionsCount}</div>
            <p className="text-xs text-muted-foreground">Mentor sessions booked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Job Matches</CardTitle>
              <CardDescription>Based on your latest skills</CardDescription>
            </div>
            <Link href="/student/jobs">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentJobs?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.companyName}</p>
                    </div>
                    <Link href={`/student/jobs`}>
                      <Button variant="outline" size="sm">Apply</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Briefcase className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>No recent job matches.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled mentorship calls</CardDescription>
            </div>
            <Link href="/student/mentors">
              <Button variant="ghost" size="sm">Find Mentors</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.upcomingSessions?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Session with {session.mentorName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>No upcoming sessions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
