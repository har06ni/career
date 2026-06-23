import { useGetCareerScore, getGetCareerScoreQueryKey, useGetCareerRecommendations, getGetCareerRecommendationsQueryKey, useGetSkillGap, getGetSkillGapQueryKey, useAnalyzeResume } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Brain, Target, Compass, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function AIAnalysis() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");

  const { data: score, isLoading: scoreLoading } = useGetCareerScore({
    query: { queryKey: getGetCareerScoreQueryKey() }
  });

  const { data: recommendations, isLoading: recLoading } = useGetCareerRecommendations({
    query: { queryKey: getGetCareerRecommendationsQueryKey() }
  });

  const { data: skillGap, isLoading: skillLoading } = useGetSkillGap({
    query: { queryKey: getGetSkillGapQueryKey() }
  });

  const analyzeResume = useAnalyzeResume();

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) {
      toast({ title: "Empty resume", description: "Please paste your resume text.", variant: "destructive" });
      return;
    }
    
    analyzeResume.mutate({ data: { resumeText } }, {
      onSuccess: () => {
        toast({ title: "Analysis complete", description: "Your resume has been analyzed." });
      },
      onError: (error) => {
        toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
      }
    });
  };

  const isLoading = scoreLoading || recLoading || skillLoading;

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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" /> AI Career Analyst
        </h1>
        <p className="text-muted-foreground">Data-driven insights to accelerate your career trajectory.</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="resume">Resume Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {score && (
              <Card className="md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardHeader>
                  <CardTitle>Career Readiness Score</CardTitle>
                  <CardDescription>Your overall competitiveness in the current market.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="stroke-muted fill-none" strokeWidth="12" />
                      <circle cx="64" cy="64" r="56" className="stroke-primary fill-none" strokeWidth="12" 
                        strokeDasharray={2 * Math.PI * 56} 
                        strokeDashoffset={2 * Math.PI * 56 * (1 - score.score / 100)} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-primary">{score.score}</span>
                      <span className="text-xs font-medium text-muted-foreground">{score.level}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Insights</h4>
                      <ul className="space-y-2">
                        {score.insights?.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Target className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Paths</CardTitle>
                  <CardDescription>Careers that match your profile.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recommendations.careerPaths.map((path, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">{path.title}</h4>
                          <span className="text-sm font-medium text-green-600">{path.match}% Match</span>
                        </div>
                        <Progress value={path.match} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>Avg: {path.averageSalary}</span>
                          <span>Growth: {path.growthRate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Action Plan</CardTitle>
                  <CardDescription>Your next steps.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.learningPlan.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start relative pb-4 last:pb-0">
                        {i !== recommendations.learningPlan.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border"></div>
                        )}
                        <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 
                          ${step.priority === 'high' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <span className="text-xs font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                          {step.estimatedTime && <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 bg-muted rounded-md">{step.estimatedTime}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          {skillGap && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Your Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skillGap.currentSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside pl-4">
                    {skillGap.strengthAreas.map((area, i) => <li key={i}>{area}</li>)}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Missing Skills</CardTitle>
                  <CardDescription>Highly requested in your target roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skillGap.missingSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-800">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside pl-4">
                    {skillGap.improvementAreas.map((area, i) => <li key={i}>{area}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Review</CardTitle>
              <CardDescription>Paste your resume text below for instant AI feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Paste your plain text resume here..." 
                className="min-h-[200px] font-mono text-sm"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleAnalyzeResume} disabled={analyzeResume.isPending}>
                  {analyzeResume.isPending ? <Spinner className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                  Analyze Resume
                </Button>
              </div>
            </CardContent>
          </Card>

          {analyzeResume.data && (
            <Card className="border-primary/50">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>{analyzeResume.data.summary}</CardDescription>
                  </div>
                  <div className="text-3xl font-bold text-primary">{analyzeResume.data.overallScore}/100</div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Strengths</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {analyzeResume.data.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-green-500">•</span> {s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Areas to Improve</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {analyzeResume.data.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-orange-500">•</span> {w}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
