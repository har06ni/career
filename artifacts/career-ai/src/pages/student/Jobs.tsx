import { useListJobs, getListJobsQueryKey, useApplyToJob } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, DollarSign, Search, Building2, Send } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function JobsMarketplace() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: jobs, isLoading } = useListJobs(
    { search: debouncedSearch || undefined },
    { query: { queryKey: getListJobsQueryKey({ search: debouncedSearch || undefined }) } }
  );

  const applyMutation = useApplyToJob();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const handleApply = () => {
    if (!selectedJob) return;
    
    applyMutation.mutate({ data: { jobId: selectedJob, coverLetter } }, {
      onSuccess: () => {
        toast({ title: "Application sent", description: "Your application has been submitted successfully." });
        setSelectedJob(null);
        setCoverLetter("");
      },
      onError: (error) => {
        toast({ title: "Application failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Marketplace</h1>
          <p className="text-muted-foreground">Find and apply to roles that match your skills.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs?.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-background">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          ) : (
            jobs?.map((job) => (
              <Card key={job.id} className="transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{job.companyName}</span>
                        </div>
                      </div>
                      {job.jobType && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {job.location}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" /> {job.salary}
                        </div>
                      )}
                      {job.isRemote && (
                        <div className="flex items-center gap-1 font-medium text-green-600">
                          Remote
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-4 text-sm line-clamp-2 text-muted-foreground">
                      {job.description}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-muted-foreground/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center items-center gap-4 bg-muted/20 md:w-48 shrink-0">
                    <Dialog open={selectedJob === job.id} onOpenChange={(open) => !open && setSelectedJob(null)}>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedJob(job.id)}>Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to {job.companyName}</DialogTitle>
                          <DialogDescription>
                            Applying for <strong>{job.title}</strong>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Cover Letter (Optional)</label>
                            <Textarea 
                              placeholder="Why are you a good fit for this role?" 
                              rows={5}
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
                          <Button onClick={handleApply} disabled={applyMutation.isPending}>
                            {applyMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Application
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="text-xs text-center text-muted-foreground">
                      {job.applicantCount || 0} applicants
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
