import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SampleSizeResult {
  id: string;
  sampleSize: number;
  totalSampleSize: number;
  adjustedSampleSize: number;
  formula: string;
  assumptions: string[];
}

export function SampleSizeCalculator() {
  const [testType, setTestType] = useState("");
  const [effectSize, setEffectSize] = useState("");
  const [power, setPower] = useState("0.80");
  const [alpha, setAlpha] = useState("0.05");
  const [results, setResults] = useState<SampleSizeResult | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const calculateSampleSize = useMutation({
    mutationFn: async (data: { testType: string; effectSize: number; power: number; alpha: number }) => {
      const response = await apiRequest("POST", "/api/sample-size/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/sample-size"] });
      toast({
        title: "Sample Size Calculated",
        description: "Sample size has been successfully calculated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate sample size. Please check your inputs.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testType || !effectSize || !power || !alpha) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    calculateSampleSize.mutate({
      testType,
      effectSize: parseFloat(effectSize),
      power: parseFloat(power),
      alpha: parseFloat(alpha)
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-calculator text-purple-600"></i>
            </div>
            <div>
              <CardTitle>Sample Size Calculator</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Calculate required sample sizes for statistical power</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <i className="fas fa-info-circle"></i>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Parameters */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-type">Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two-sample t-test">Two-sample t-test</SelectItem>
                    <SelectItem value="paired t-test">Paired t-test</SelectItem>
                    <SelectItem value="one-way anova">One-way ANOVA</SelectItem>
                    <SelectItem value="proportion test">Proportion test</SelectItem>
                    <SelectItem value="correlation test">Correlation test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="effect-size">Effect Size</Label>
                <Input
                  id="effect-size"
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={effectSize}
                  onChange={(e) => setEffectSize(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="power">Power (1-β)</Label>
                <Select value={power} onValueChange={setPower}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.80">0.80 (80%)</SelectItem>
                    <SelectItem value="0.90">0.90 (90%)</SelectItem>
                    <SelectItem value="0.95">0.95 (95%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alpha">Alpha (α)</Label>
                <Select value={alpha} onValueChange={setAlpha}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.05">0.05 (5%)</SelectItem>
                    <SelectItem value="0.01">0.01 (1%)</SelectItem>
                    <SelectItem value="0.001">0.001 (0.1%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={calculateSampleSize.isPending}
            >
              {calculateSampleSize.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Calculating...
                </>
              ) : (
                <>
                  <i className="fas fa-calculator mr-2"></i>
                  Calculate Sample Size
                </>
              )}
            </Button>
          </form>

          {/* Results Display */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Calculation Results</h4>
            
            {results ? (
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Required Sample Size</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{results.sampleSize}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">per group</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-slate-800 rounded p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total N</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{results.totalSampleSize}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded p-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">+20% Dropout</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{results.adjustedSampleSize}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p><strong>Formula:</strong> {results.formula}</p>
                  <p><strong>Assumptions:</strong> {results.assumptions.join(", ")}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Required Sample Size</p>
                  <p className="text-2xl font-bold text-slate-400">--</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">per group</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter parameters and calculate to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Formula Explanation */}
        {results && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center">
              <i className="fas fa-graduation-cap text-blue-600 mr-2"></i>
              Statistical Formula & Explanation
            </h5>
            <div className="font-mono text-sm bg-white dark:bg-slate-800 rounded p-3 mb-2">
              {results.formula}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This calculation provides the minimum sample size needed to detect the specified effect size 
              with the given statistical power and significance level.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
