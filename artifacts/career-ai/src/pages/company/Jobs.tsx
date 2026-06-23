import { useGetMyJobs, getGetMyJobsQueryKey, useCreateJob, useUpdateJob, useDeleteJob } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description is required"),
  skills: z.string().optional(), // We'll split this by comma for the API
  salary: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  jobType: z.string().optional(),
  isRemote: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function CompanyJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const { data: jobs, isLoading } = useGetMyJobs({
    query: { queryKey: getGetMyJobsQueryKey() }
  });

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: "",
      salary: "",
      location: "",
      experienceLevel: "",
      jobType: "",
      isRemote: false,
      isActive: true,
    },
  });

  const onSubmit = (data: JobFormValues) => {
    const payload = {
      ...data,
      skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    if (editingJobId) {
      updateJob.mutate({ jobId: editingJobId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Job updated", description: "The job listing has been updated." });
          setIsCreateOpen(false);
          setEditingJobId(null);
          queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
        },
        onError: (error) => {
          toast({ title: "Failed to update job", description: error.message, variant: "destructive" });
        }
      });
    } else {
      createJob.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Job created", description: "The new job listing is now active." });
          setIsCreateOpen(false);
          form.reset();
          queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
        },
        onError: (error) => {
          toast({ title: "Failed to create job", description: error.message, variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (job: any) => {
    form.reset({
      title: job.title,
      description: job.description,
      skills: job.skills?.join(", ") || "",
      salary: job.salary || "",
      location: job.location || "",
      experienceLevel: job.experienceLevel || "",
      jobType: job.jobType || "",
      isRemote: job.isRemote || false,
      isActive: job.isActive !== false,
    });
    setEditingJobId(job.id);
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate({ jobId: id }, {
        onSuccess: () => {
          toast({ title: "Job deleted", description: "The job listing has been removed." });
          queryClient.invalidateQueries({ queryKey: getGetMyJobsQueryKey() });
        },
        onError: (error) => {
          toast({ title: "Failed to delete job", description: error.message, variant: "destructive" });
        }
      });
    }
  };

  const handleOpenCreate = (open: boolean) => {
    if (open) {
      setEditingJobId(null);
      form.reset({
        title: "",
        description: "",
        skills: "",
        salary: "",
        location: "",
        experienceLevel: "",
        jobType: "",
        isRemote: false,
        isActive: true,
      });
    }
    setIsCreateOpen(open);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground">Post and manage your open roles.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={handleOpenCreate}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0"><Plus className="mr-2 h-4 w-4" /> Post New Job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJobId ? "Edit Job" : "Post a New Job"}</DialogTitle>
              <DialogDescription>Fill in the details for the role.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g. Senior Frontend Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Job responsibilities and requirements..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. San Francisco, CA" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="salary" render={({ field }) => (
                    <FormItem><FormLabel>Salary Range</FormLabel><FormControl><Input placeholder="e.g. $120k - $150k" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="jobType" render={({ field }) => (
                    <FormItem><FormLabel>Job Type</FormLabel><FormControl><Input placeholder="e.g. Full-time, Contract" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                    <FormItem><FormLabel>Experience Level</FormLabel><FormControl><Input placeholder="e.g. Mid-Level, Senior" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem><FormLabel>Required Skills (comma separated)</FormLabel><FormControl><Input placeholder="React, TypeScript, Node.js" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex gap-6 pt-2">
                  <FormField control={form.control} name="isRemote" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Remote Position</FormLabel></div></FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Active (Visible to candidates)</FormLabel></div></FormItem>
                  )} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
                    {(createJob.isPending || updateJob.isPending) ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {editingJobId ? "Save Changes" : "Post Job"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
              <h3 className="text-lg font-medium">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job listing to start receiving applications.</p>
              <Button onClick={() => handleOpenCreate(true)}><Plus className="mr-2 h-4 w-4" /> Post New Job</Button>
            </div>
          ) : (
            jobs?.map((job) => (
              <Card key={job.id} className={!job.isActive ? "opacity-60" : ""}>
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{job.title}</h3>
                          {!job.isActive && <span className="text-xs bg-muted px-2 py-0.5 rounded-md font-medium">Draft/Inactive</span>}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          {job.location && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</div>}
                          {job.salary && <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {job.salary}</div>}
                          {job.isRemote && <div className="flex items-center gap-1 text-green-600">Remote</div>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-sm">
                        <span className="font-semibold text-primary">{job.applicantCount || 0} applicants</span>
                        <span className="text-muted-foreground">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills?.map((skill, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l p-6 flex flex-row md:flex-col justify-end md:justify-center items-center gap-2 bg-muted/5 md:w-32 shrink-0">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(job)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
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
