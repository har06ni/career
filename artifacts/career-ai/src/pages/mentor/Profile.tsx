import { useGetMentorProfile, getGetMentorProfileQueryKey, useUpdateMentorProfile } from "@workspace/api-client-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Save, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  company: z.string().optional(),
  title: z.string().optional(),
  experience: z.coerce.number().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  skills: z.array(z.string()).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pricePerSession: z.coerce.number().optional(),
  availability: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function MentorProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetMentorProfile({
    query: { queryKey: getGetMentorProfileQueryKey() }
  });

  const updateProfile = useUpdateMentorProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company: "",
      title: "",
      experience: undefined,
      bio: "",
      skills: [],
      avatarUrl: "",
      pricePerSession: undefined,
      availability: [],
    },
  });

  const isInitialized = useRef(false);

  useEffect(() => {
    if (profile && !isInitialized.current) {
      form.reset({
        company: profile.company || "",
        title: profile.title || "",
        experience: profile.experience || undefined,
        bio: profile.bio || "",
        skills: profile.skills || [],
        avatarUrl: profile.avatarUrl || "",
        pricePerSession: profile.pricePerSession || undefined,
        availability: profile.availability || [],
      });
      isInitialized.current = true;
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({ data }, {
      onSuccess: (updatedProfile) => {
        toast({ title: "Profile updated", description: "Your mentor profile has been saved." });
        queryClient.setQueryData(getGetMentorProfileQueryKey(), updatedProfile);
      },
      onError: (error) => {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentor Profile</h1>
        <p className="text-muted-foreground">Manage your expertise and session offerings.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Professional Details</CardTitle>
              <CardDescription>Tell students about your background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="I specialize in..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentorship Offerings</CardTitle>
              <CardDescription>Set your rates and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pricePerSession"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Price Per Session ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormDescription>Your hourly rate for 1:1 sessions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
