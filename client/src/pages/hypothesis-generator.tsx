import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lightbulb, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HypothesisResponse {
  id: string;
  hypothesis: string;
  domain: string;
  question: string;
  variables: string;
  constraints: string | null;
  generatedContent: string;
  createdAt: string;
}

export function HypothesisGenerator() {
  const [domain, setDomain] = useState("");
  const [question, setQuestion] = useState("");
  const [variables, setVariables] = useState("");
  const [constraints, setConstraints] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedHypothesis, setGeneratedHypothesis] = useState<HypothesisResponse | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: {
      domain: string;
      question: string;
      variables: string;
      constraints?: string;
      searchQuery?: string;
    }): Promise<HypothesisResponse> => {
      const response = await fetch("/api/hypotheses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to generate hypothesis");
      }
      
      return await response.json();
    },
    onSuccess: (data: HypothesisResponse) => {
      setGeneratedHypothesis(data);
      queryClient.invalidateQueries({ queryKey: ["/api/hypotheses"] });
      toast({
        title: "Hypothesis Generated",
        description: "Your research hypothesis has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error generating hypothesis:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate hypothesis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!domain.trim() || !question.trim() || !variables.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in domain, research question, and variables.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      domain: domain.trim(),
      question: question.trim(),
      variables: variables.trim(),
      constraints: constraints.trim() || undefined,
      searchQuery: searchQuery.trim() || undefined,
    });
  };

  const handleClear = () => {
    setDomain("");
    setQuestion("");
    setVariables("");
    setConstraints("");
    setSearchQuery("");
    setGeneratedHypothesis(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Hypothesis Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generate evidence-linked research hypotheses using AI and scientific literature
        </p>
      </div>

      <div className="grid gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Research Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">Research Domain *</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select research domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="environmental-science">Environmental Science</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="social-science">Social Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Literature Search Query (Optional)</Label>
                <Input
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., protein folding machine learning"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Research Question *</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What specific question are you trying to answer? Be as clear and specific as possible."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variables">Variables to Study *</Label>
              <Textarea
                id="variables"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder="List the independent and dependent variables you want to investigate."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints & Limitations (Optional)</Label>
              <Textarea
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Any practical constraints, ethical considerations, or methodological limitations to consider."
                className="min-h-[60px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Hypothesis...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Generate Hypothesis
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={generateMutation.isPending}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Hypothesis */}
        {generatedHypothesis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Generated Hypothesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <strong>Domain:</strong> {generatedHypothesis.domain}
                  </div>
                  <div>
                    <strong>Generated:</strong> {new Date(generatedHypothesis.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <strong className="text-sm">Research Question:</strong>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    {generatedHypothesis.question}
                  </p>
                </div>

                <div className="space-y-2">
                  <strong className="text-sm">Variables:</strong>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    {generatedHypothesis.variables}
                  </p>
                </div>

                {generatedHypothesis.constraints && (
                  <div className="space-y-2">
                    <strong className="text-sm">Constraints:</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      {generatedHypothesis.constraints}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <strong className="text-sm">AI-Generated Hypothesis:</strong>
                  <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded whitespace-pre-wrap">
                    {generatedHypothesis.generatedContent}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This hypothesis was generated using AI analysis of scientific literature. 
                    Please review and validate before using in your research.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}