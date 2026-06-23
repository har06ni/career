import { useGetCompanyDashboard, getGetCompanyDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Briefcase, Users, FileText, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CompanyDashboard() {
  const { data: dashboard, isLoading } = useGetCompanyDashboard({
    query: {
      queryKey: getGetCompanyDashboardQueryKey()
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
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-muted-foreground">Overview of your hiring pipeline and active jobs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.activeJobsCount}</div>
            <p className="text-xs text-muted-foreground">Currently open roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalApplicationsCount}</div>
            <p className="text-xs text-muted-foreground">Across all jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.shortlistedCount}</div>
            <p className="text-xs text-muted-foreground">Candidates in review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.hiredCount || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully hired</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidates who applied</CardDescription>
            </div>
            <Link href="/company/applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentApplications?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold">{app.studentName}</h4>
                      <p className="text-sm text-muted-foreground">Applied for: {app.jobTitle}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-muted">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>No recent applications.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>Your recently posted roles</CardDescription>
            </div>
            <Link href="/company/jobs">
              <Button variant="ghost" size="sm">Manage Jobs</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard.recentJobs?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.location} • {job.jobType}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{job.applicantCount || 0}</div>
                      <div className="text-xs text-muted-foreground">applicants</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Briefcase className="mx-auto h-8 w-8 mb-2 opacity-20" />
                <p>No active jobs.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
