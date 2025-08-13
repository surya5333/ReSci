import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { apiRequest } from "@/lib/queryClient";

interface ResearchMethod {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  citations: string[];
  feasibility: "High" | "Moderate" | "Low";
  confidence: number;
}

interface MethodsRecommendation {
  id: string;
  primaryMethods: ResearchMethod[];
  alternativeMethod: ResearchMethod;
  searchQuery: string;
  confidence: number;
}

interface MethodsFormData {
  hypothesis: string;
  variables: string;
  constraints: string;
}

export function MethodsRecommender() {
  const { data: formData, updateData } = useFormPersistence<MethodsFormData>("methods", {
    hypothesis: "",
    variables: "",
    constraints: ""
  });
  const [results, setResults] = useState<MethodsRecommendation | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMethods = useMutation({
    mutationFn: async (data: { hypothesis: string; variables: string; constraints: string }) => {
      const response = await apiRequest("POST", "/api/methods/recommend", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/methods"] });
      toast({
        title: "Methods Generated",
        description: "Research methods have been successfully generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate methods. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hypothesis.trim() || !formData.variables.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both hypothesis and variables.",
        variant: "destructive",
      });
      return;
    }
    generateMethods.mutate({ 
      hypothesis: formData.hypothesis, 
      variables: formData.variables, 
      constraints: formData.constraints 
    });
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case "High": return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      case "Moderate": return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
      case "Low": return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
      default: return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100";
    }
  };

  const MethodCard = ({ method, type, confidence }: { method: ResearchMethod; type: string; confidence?: number }) => (
    <div className={`rounded-lg p-4 border ${
      type === "primary" 
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
        : type === "secondary"
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge className={
            type === "primary" 
              ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100" 
              : type === "secondary"
              ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
              : "bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100"
          }>
            {type === "primary" ? "Primary Method" : type === "secondary" ? "Primary Method" : "Backup Option"}
          </Badge>
          {confidence && (
            <span className={`text-xs ${
              type === "primary" 
                ? "text-emerald-600 dark:text-emerald-400" 
                : type === "secondary"
                ? "text-blue-600 dark:text-blue-400"
                : "text-amber-600 dark:text-amber-400"
            }`}>
              Confidence: {confidence}%
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm">
          <i className="fas fa-bookmark"></i>
        </Button>
      </div>
      
      <h5 className="font-semibold text-slate-900 dark:text-white mb-2">{method.title}</h5>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{method.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Pros</p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {method.pros.map((pro, index) => (
              <li key={index}>• {pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cons</p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {method.cons.map((con, index) => (
              <li key={index}>• {con}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Citations: {method.citations.join(", ")}</span>
        <div className="flex items-center space-x-2">
          <span>Feasibility:</span>
          <Badge className={getFeasibilityColor(method.feasibility)}>
            {method.feasibility}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <i className="fas fa-flask text-blue-600"></i>
          </div>
          <div>
            <CardTitle>Methods Recommender</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get evidence-based research method recommendations</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="hypothesis">Research Hypothesis</Label>
              <Textarea
                id="hypothesis"
                placeholder="Enter your research hypothesis..."
                rows={4}
                value={formData.hypothesis}
                onChange={(e) => updateData({ hypothesis: e.target.value })}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="variables">Research Variables</Label>
              <Input
                id="variables"
                placeholder="Independent and dependent variables..."
                value={formData.variables}
                onChange={(e) => updateData({ variables: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="constraints">Constraints & Limitations</Label>
              <Input
                id="constraints"
                placeholder="Budget, time, ethical considerations..."
                value={formData.constraints}
                onChange={(e) => updateData({ constraints: e.target.value })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={generateMethods.isPending}
            >
              {generateMethods.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generate Methods
                </>
              )}
            </Button>
          </div>

          {/* Real-time Preview */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Search Preview</h4>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Query:</strong> 
                <span className="font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded ml-2">
                  {formData.hypothesis ? `${formData.hypothesis.slice(0, 30)}...` : "Enter hypothesis to see query"}
                </span>
              </p>
              <p className="text-slate-600 dark:text-slate-400"><strong>Target:</strong> Experimental methods, measurement techniques</p>
              <p className="text-slate-600 dark:text-slate-400"><strong>Sources:</strong> PubMed, Research databases</p>
            </div>
          </div>
        </form>

        {/* Results */}
        {results && (
          <>
            <Separator />
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <i className="fas fa-check-circle text-emerald-600 mr-2"></i>
                Recommended Methods
              </h4>

              <div className="space-y-4 mb-6">
                {results.primaryMethods.map((method, index) => (
                  <MethodCard 
                    key={index} 
                    method={method} 
                    type={index === 0 ? "primary" : "secondary"} 
                    confidence={method.confidence} 
                  />
                ))}
              </div>

              {results.alternativeMethod && (
                <div>
                  <h5 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <i className="fas fa-lightbulb text-amber-600 mr-2"></i>
                    Alternative Method
                  </h5>
                  <MethodCard method={results.alternativeMethod} type="alternative" />
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
