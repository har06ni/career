import { useListMentors, getListMentorsQueryKey, useBookSession } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Star, Clock, Briefcase, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Mentors() {
  const { toast } = useToast();
  const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
  
  // Booking state
  const [scheduledAt, setScheduledAt] = useState("");
  const [topic, setTopic] = useState("");

  const { data: mentors, isLoading } = useListMentors(
    {}, 
    { query: { queryKey: getListMentorsQueryKey() } }
  );

  const bookSession = useBookSession();

  const handleBook = () => {
    if (!selectedMentor || !scheduledAt) {
      toast({ title: "Incomplete details", description: "Please provide date and time.", variant: "destructive" });
      return;
    }
    
    // Format to ISO string for backend
    const dateObj = new Date(scheduledAt);
    
    bookSession.mutate({ data: { mentorId: selectedMentor, scheduledAt: dateObj.toISOString(), topic, duration: 60 } }, {
      onSuccess: () => {
        toast({ title: "Session requested", description: "The mentor will review your request." });
        setSelectedMentor(null);
        setScheduledAt("");
        setTopic("");
      },
      onError: (error) => {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Marketplace</h1>
          <p className="text-muted-foreground">Book 1:1 sessions with industry experts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mentors?.map((mentor) => (
            <Card key={mentor.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-border/50">
              <CardHeader className="text-center pb-4 bg-muted/20 border-b">
                <Avatar className="h-20 w-20 mx-auto border-4 border-background shadow-sm mb-4">
                  <AvatarImage src={mentor.avatarUrl || undefined} />
                  <AvatarFallback className="text-xl">{mentor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{mentor.name}</CardTitle>
                <CardDescription className="flex flex-col items-center gap-1 mt-1 text-foreground font-medium">
                  {mentor.title} {mentor.company && `at ${mentor.company}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-foreground">{mentor.rating?.toFixed(1) || "New"}</span>
                    <span>({mentor.sessionsCompleted} sessions)</span>
                  </div>
                  <div className="font-semibold text-foreground">
                    ${mentor.pricePerSession}/hr
                  </div>
                </div>

                {mentor.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {mentor.bio}
                  </p>
                )}

                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-4">
                    {mentor.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="inline-flex text-[10px] items-center rounded-sm bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 4 && (
                      <span className="inline-flex text-[10px] items-center rounded-sm bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                        +{mentor.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-4 pt-0 border-t bg-muted/10 mt-auto flex-col gap-2">
                <Dialog open={selectedMentor === mentor.id} onOpenChange={(open) => !open && setSelectedMentor(null)}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" onClick={() => setSelectedMentor(mentor.id)}>
                      <Calendar className="mr-2 h-4 w-4" /> Book Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book Session with {mentor.name}</DialogTitle>
                      <DialogDescription>
                        {mentor.title} at {mentor.company} • ${mentor.pricePerSession}/hr
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date & Time</label>
                        <Input 
                          type="datetime-local" 
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Topic / What do you want to discuss?</label>
                        <Textarea 
                          placeholder="I need help with system design interviews..." 
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedMentor(null)}>Cancel</Button>
                      <Button onClick={handleBook} disabled={bookSession.isPending || !scheduledAt}>
                        {bookSession.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
