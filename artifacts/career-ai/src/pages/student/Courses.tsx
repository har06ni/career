import { useListCourses, getListCoursesQueryKey, useEnrollCourse, useGetMyEnrollments, getGetMyEnrollmentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, CirclePlay as PlayCircle, Star, Award, CircleCheck as CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

export default function Courses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useListCourses(
    {}, 
    { query: { queryKey: getListCoursesQueryKey() } }
  );

  const { data: enrollments, isLoading: enrollmentsLoading } = useGetMyEnrollments({
    query: { queryKey: getGetMyEnrollmentsQueryKey() }
  });

  const enrollCourse = useEnrollCourse();

  const handleEnroll = (courseId: number) => {
    enrollCourse.mutate({ courseId }, {
      onSuccess: () => {
        toast({ title: "Successfully enrolled", description: "You can now start learning!" });
        queryClient.invalidateQueries({ queryKey: getGetMyEnrollmentsQueryKey() });
      },
      onError: (error) => {
        toast({ title: "Enrollment failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const isEnrolled = (courseId: number) => {
    return enrollments?.some(e => e.courseId === courseId);
  };

  const isLoading = coursesLoading || enrollmentsLoading;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground">Upskill to meet your career goals.</p>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="catalog">Browse Courses</TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {isLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => (
                <Card key={course.id} className="flex flex-col h-full overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center relative border-b">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                    )}
                    <span className="absolute top-2 right-2 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm shadow-sm">
                      {course.category}
                    </span>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 leading-tight">{course.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">{course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {course.duration && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</div>}
                      {course.level && <div className="flex items-center gap-1"><Award className="h-3 w-3" /> {course.level}</div>}
                      {course.rating && <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {course.rating.toFixed(1)}</div>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 px-6">
                    {isEnrolled(course.id) ? (
                      <Button variant="secondary" className="w-full" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" /> Enrolled
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollCourse.isPending}
                      >
                        Enroll Now {course.isFree ? "(Free)" : `$${course.price}`}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-learning">
          {isLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : enrollments?.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-background">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No courses yet</h3>
              <p className="text-muted-foreground">Enroll in courses from the catalog to start learning.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrollments?.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-32 md:h-auto bg-muted border-b md:border-b-0 md:border-r flex items-center justify-center">
                      {enrollment.courseThumbnailUrl ? (
                         <img src={enrollment.courseThumbnailUrl} alt={enrollment.courseTitle || "Course"} className="w-full h-full object-cover" />
                      ) : (
                         <PlayCircle className="h-10 w-10 text-muted-foreground opacity-20" />
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl">{enrollment.courseTitle}</h3>
                        {enrollment.completed && (
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">{enrollment.courseCategory}</p>
                      
                      <div className="mt-auto space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l p-6 flex items-center justify-center bg-muted/10 md:w-48">
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" /> 
                        {enrollment.progress === 0 ? "Start" : enrollment.completed ? "Review" : "Continue"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
