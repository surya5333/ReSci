import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { apiRequest } from "@/lib/queryClient";

interface Evidence {
  title: string;
  authors: string;
  year: string;
  journal: string;
  match: number;
  quote: string;
  impactFactor?: number;
}

interface VerificationResult {
  id: string;
  status: "supported" | "partially_supported" | "not_supported";
  confidence: number;
  supportingEvidence: Evidence[];
  considerations: string[];
  aiAnalysis: string;
}

interface CitationFormData {
  claim: string;
}

export function CitationVerifier() {
  const { data: formData, updateData } = useFormPersistence<CitationFormData>("citation", {
    claim: ""
  });
  const [results, setResults] = useState<VerificationResult | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyCitation = useMutation({
    mutationFn: async (data: { claim: string }) => {
      const response = await apiRequest("POST", "/api/citations/verify", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/citations"] });
      toast({
        title: "Citation Verified",
        description: "Citation has been successfully verified.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to verify citation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.claim.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a research claim to verify.",
        variant: "destructive",
      });
      return;
    }
    verifyCitation.mutate({ claim: formData.claim });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "supported": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      case "partially_supported": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
      case "not_supported": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "supported": return "Supported";
      case "partially_supported": return "Partially Supported";
      case "not_supported": return "Not Supported";
      default: return "Unknown";
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200";
    if (match >= 70) return "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200";
    return "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <i className="fas fa-check-circle text-green-600"></i>
          </div>
          <div>
            <CardTitle>Citation Verifier</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Verify research claims against published literature</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Claim Input */}
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="claim">Research Claim to Verify</Label>
            <Textarea
              id="claim"
              placeholder="Enter the research claim you want to verify..."
              rows={3}
              value={formData.claim}
              onChange={(e) => updateData({ claim: e.target.value })}
              className="resize-none"
            />
            
            <div className="mt-3 flex items-center justify-between">
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={verifyCitation.isPending}
              >
                {verifyCitation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Verify Claim
                  </>
                )}
              </Button>
              
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <span>Sources: PubMed, arXiv</span>
                <span>•</span>
                <span>Analysis: AI-powered</span>
              </div>
            </div>
          </div>
        </form>

        {/* Verification Results */}
        {results && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Verification Results</h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(results.status)}>
                    {getStatusText(results.status)}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Confidence: {results.confidence}%</span>
                </div>
              </div>

              {/* Supporting Evidence */}
              {results.supportingEvidence.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-green-600 mt-1"></i>
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900 dark:text-white mb-2">Supporting Evidence</h5>
                        
                        <div className="space-y-3">
                          {results.supportingEvidence.map((evidence, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded border border-green-200 dark:border-green-700 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h6 className="font-medium text-slate-900 dark:text-white text-sm">{evidence.authors} ({evidence.year})</h6>
                                <Badge className={getMatchColor(evidence.match)}>
                                  {evidence.match}% match
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">"{evidence.title}"</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">"{evidence.quote}"</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {evidence.journal} {evidence.impactFactor && `• Impact Factor: ${evidence.impactFactor}`}
                                </span>
                                <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700 text-xs p-0">
                                  <i className="fas fa-external-link-alt mr-1"></i>View Paper
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Considerations */}
                  {results.considerations.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-exclamation-triangle text-amber-600 mt-1"></i>
                        <div>
                          <h5 className="font-medium text-slate-900 dark:text-white mb-2">Additional Considerations</h5>
                          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                            {results.considerations.map((consideration, index) => (
                              <li key={index}>• {consideration}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-robot text-blue-600 mt-1"></i>
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-white mb-2">AI Analysis Summary</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{results.aiAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="outline">
                  <i className="fas fa-download mr-2"></i>
                  Export Report
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <i className="fas fa-share mr-2"></i>
                  Share Results
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
