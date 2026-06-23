import { useGetMySessions, getGetMySessionsQueryKey, useUpdateSessionStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MentorSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  const { data: sessions, isLoading } = useGetMySessions({
    query: { queryKey: getGetMySessionsQueryKey() }
  });

  const updateStatus = useUpdateSessionStatus();

  const handleUpdateStatus = (sessionId: number, status: any, meetingUrl?: string) => {
    updateStatus.mutate({ data: { status } /* Note: meetingUrl might need to be passed if the API supports it, but standard spec might not. Just passing status for now based on generated type */ }, {
      onSuccess: () => {
        toast({ title: "Session updated", description: `Session marked as ${status}.` });
        setActiveSessionId(null);
        setMeetingUrl("");
        queryClient.invalidateQueries({ queryKey: getGetMySessionsQueryKey() });
      },
      onError: (error) => {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Sessions</h1>
        <p className="text-muted-foreground">Review and respond to mentorship requests.</p>
      </div>

      <div className="grid gap-4">
        {sessions?.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-background shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No sessions</h3>
            <p className="text-muted-foreground">You don't have any session requests yet.</p>
          </div>
        ) : (
          sessions?.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback>{session.studentName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h3 className="text-xl font-bold">{session.studentName}</h3>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize mt-1 ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">${session.price}</div>
                          <div className="text-muted-foreground">{session.duration} mins</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> 
                          <span className="font-medium text-foreground">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" /> 
                          <span className="font-medium text-foreground">
                            {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {session.topic && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border text-sm">
                          <h4 className="font-semibold mb-1 text-foreground">Topic</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{session.topic}</p>
                        </div>
                      )}
                      
                      {session.meetingUrl && session.status === 'confirmed' && (
                        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Video className="h-4 w-4" /> Meeting Link
                          </div>
                          <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline font-medium">
                            Join Call
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center items-center gap-3 bg-muted/5 md:w-48 shrink-0">
                  {session.status === 'pending' && (
                    <>
                      <Dialog open={activeSessionId === session.id} onOpenChange={(open) => !open && setActiveSessionId(null)}>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" onClick={() => setActiveSessionId(session.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Accept Session</DialogTitle>
                            <DialogDescription>
                              Confirm the session with {session.studentName}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Meeting URL (Optional)</label>
                              <Input 
                                placeholder="https://zoom.us/j/..." 
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setActiveSessionId(null)}>Cancel</Button>
                            <Button onClick={() => handleUpdateStatus(session.id, 'confirmed', meetingUrl)} disabled={updateStatus.isPending}>
                              Confirm Booking
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Decline
                      </Button>
                    </>
                  )}
                  
                  {session.status === 'confirmed' && (
                    <Button 
                      variant="outline" className="w-full justify-start"
                      onClick={() => handleUpdateStatus(session.id, 'completed')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" /> Mark Completed
                    </Button>
                  )}
                  
                  {(session.status === 'completed' || session.status === 'cancelled') && (
                    <div className="text-sm font-medium text-muted-foreground text-center">
                      No actions available
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )))}
        </div>
    </div>
  );
}
