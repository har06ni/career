import { useListStudents, getListStudentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, GraduationCap, MapPin, Link as LinkIcon, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Candidates() {
  const [searchSkills, setSearchSkills] = useState("");
  const [debouncedSkills, setDebouncedSkills] = useState("");

  const { data: students, isLoading } = useListStudents(
    { skills: debouncedSkills || undefined },
    { query: { queryKey: getListStudentsQueryKey({ skills: debouncedSkills || undefined }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSkills(searchSkills);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Candidates</h1>
          <p className="text-muted-foreground">Find students matching your required skills.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by skills (e.g. React, Python)" 
              className="pl-8" 
              value={searchSkills}
              onChange={(e) => setSearchSkills(e.target.value)}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {students?.length === 0 ? (
            <div className="col-span-full text-center py-12 border rounded-xl bg-background">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No candidates found</h3>
              <p className="text-muted-foreground">Try adjusting your skill search.</p>
            </div>
          ) : (
            students?.map((student) => (
              <Card key={student.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <Avatar className="h-16 w-16 border shadow-sm">
                      <AvatarImage src={student.avatarUrl || undefined} />
                      <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      {student.linkedinUrl && (
                        <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                          <LinkIcon className="h-4 w-4" />
                        </a>
                      )}
                      {student.resumeUrl && (
                        <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <CardDescription className="flex flex-col gap-1 mt-1 text-foreground font-medium">
                    {student.degree} {student.college && `at ${student.college}`}
                  </CardDescription>
                  {student.graduationYear && (
                    <div className="text-xs text-muted-foreground">Class of {student.graduationYear}</div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-2 flex-1 flex flex-col gap-4">
                  {student.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {student.bio}
                    </p>
                  )}

                  {student.skills && student.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-4">
                      {student.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="inline-flex text-[10px] items-center rounded-sm bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 5 && (
                        <span className="inline-flex text-[10px] items-center rounded-sm bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                          +{student.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 border-t bg-muted/5 mt-auto">
                   {/* In a real app, maybe a contact or invite to apply button */}
                   <Button variant="outline" className="w-full mt-4" disabled>Message Candidate (Coming soon)</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
