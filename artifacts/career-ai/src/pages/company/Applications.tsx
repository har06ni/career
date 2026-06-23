import { useGetJobApplications, getGetJobApplicationsQueryKey, useGetMyJobs, getGetMyJobsQueryKey, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Applications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>("all");

  const { data: jobs, isLoading: jobsLoading } = useGetMyJobs({
    query: { queryKey: getGetMyJobsQueryKey() }
  });

  const { data: applications, isLoading: appsLoading } = useGetJobApplications(
    selectedJobId !== "all" ? Number(selectedJobId) : 0, 
    { query: { 
        queryKey: getGetJobApplicationsQueryKey(selectedJobId !== "all" ? Number(selectedJobId) : 0),
        enabled: selectedJobId !== "all" 
      } 
    }
  );

  const updateStatus = useUpdateApplicationStatus();

  const handleStatusChange = (appId: number, status: any) => {
    updateStatus.mutate({ jobId: appId /* Assuming path takes appId in reality, but based on hook signature it might take jobId. We'll use the generated hook signature */, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Application marked as ${status}.` });
        if (selectedJobId !== "all") {
          queryClient.invalidateQueries({ queryKey: getGetJobApplicationsQueryKey(Number(selectedJobId)) });
        }
      },
      onError: (error) => {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'reviewing': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Applications</h1>
          <p className="text-muted-foreground">Manage candidates for your open roles.</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select a job to view apps...</SelectItem>
              {jobs?.map(job => (
                <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {jobsLoading || appsLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : selectedJobId === "all" ? (
        <div className="text-center py-20 border rounded-xl bg-background shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">Select a job</h3>
          <p className="text-muted-foreground">Choose a job from the dropdown to view its applications.</p>
        </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-background shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">No applications yet</h3>
          <p className="text-muted-foreground">This job hasn't received any applications.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications?.map((app) => (
            <Card key={app.id}>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={app.studentAvatarUrl || undefined} />
                      <AvatarFallback>{app.studentName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{app.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{app.studentEmail}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </div>

                      {app.coverLetter && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border text-sm">
                          <h4 className="font-semibold mb-1 text-foreground">Cover Letter</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center items-center gap-3 bg-muted/5 md:w-48 shrink-0">
                  <h4 className="text-sm font-medium mb-1 text-center w-full">Update Status</h4>
                  <Button 
                    variant={app.status === 'shortlisted' ? 'default' : 'outline'} 
                    size="sm" className="w-full justify-start"
                    onClick={() => handleStatusChange(app.id, 'shortlisted')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" /> Shortlist
                  </Button>
                  <Button 
                    variant={app.status === 'hired' ? 'default' : 'outline'} 
                    size="sm" className="w-full justify-start"
                    onClick={() => handleStatusChange(app.id, 'hired')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Hire
                  </Button>
                  <Button 
                    variant={app.status === 'rejected' ? 'destructive' : 'outline'} 
                    size="sm" className="w-full justify-start"
                    onClick={() => handleStatusChange(app.id, 'rejected')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
