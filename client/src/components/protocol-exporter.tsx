import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { apiRequest } from "@/lib/queryClient";

interface Method {
  id: string;
  hypothesis: string;
  variables: string;
  primaryMethods: any[];
  createdAt: string;
}

interface ProtocolFormData {
  selectedMethods: string[];
  selectedFormat: string;
  title: string;
  includeCitations: boolean;
  includeEquipment: boolean;
  includeCostEstimates: boolean;
}

export function ProtocolExporter() {
  const { data: formData, updateData } = useFormPersistence<ProtocolFormData>("protocol", {
    selectedMethods: [],
    selectedFormat: "pdf",
    title: "",
    includeCitations: true,
    includeEquipment: true,
    includeCostEstimates: false
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's methods
  const { data: methods = [] } = useQuery<Method[]>({
    queryKey: ["/api/methods"],
  });

  const exportProtocol = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/protocols/export", data);
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${data.title}_${new Date().toISOString().split('T')[0]}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Protocol Exported",
        description: "Protocol has been successfully exported and downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: "Failed to export protocol. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMethodSelection = (methodId: string, checked: boolean) => {
    if (checked) {
      updateData({ selectedMethods: [...formData.selectedMethods, methodId] });
    } else {
      updateData({ selectedMethods: formData.selectedMethods.filter(id => id !== methodId) });
    }
  };

  const handleFormatSelection = (format: string) => {
    updateData({ selectedFormat: format });
  };

  const handleExport = () => {
    if (formData.selectedMethods.length === 0) {
      toast({
        title: "No Methods Selected",
        description: "Please select at least one method to export.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for the protocol.",
        variant: "destructive",
      });
      return;
    }

    exportProtocol.mutate({
      methodIds: formData.selectedMethods,
      title: formData.title,
      format: formData.selectedFormat,
      includeCitations: formData.includeCitations,
      includeEquipment: formData.includeEquipment,
      includeCostEstimates: formData.includeCostEstimates
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'docx': return 'fas fa-file-word';
      case 'json': return 'fas fa-file-code';
      case 'txt': return 'fas fa-file-alt';
      default: return 'fas fa-file';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
            <i className="fas fa-file-export text-indigo-600"></i>
          </div>
          <div>
            <CardTitle>Protocol Exporter</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Export research methods to lab-friendly formats</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="protocol-title">Protocol Title</Label>
              <Input
                id="protocol-title"
                placeholder="Enter protocol title..."
                value={formData.title}
                onChange={(e) => updateData({ title: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                Select Methods to Export
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {methods.length > 0 ? (
                  methods.map((method: Method) => (
                    <label 
                      key={method.id}
                      className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    >
                      <Checkbox 
                        checked={formData.selectedMethods.includes(method.id)}
                        onCheckedChange={(checked) => handleMethodSelection(method.id, checked as boolean)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 dark:text-white truncate">
                          {method.primaryMethods[0]?.title || 'Untitled Method'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {method.hypothesis.slice(0, 60)}...
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No methods available. Generate some methods first.
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                Export Format
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['pdf', 'docx', 'json', 'txt'].map((format) => (
                  <button
                    key={format}
                    onClick={() => handleFormatSelection(format)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                      formData.selectedFormat === format
                        ? 'border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <i className={getFormatIcon(format)}></i>
                    <span className="text-sm font-medium">{format.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Additional Options
              </Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.includeCitations}
                    onCheckedChange={(checked) => updateData({ includeCitations: checked === true })}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Include citations and references</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.includeEquipment}
                    onCheckedChange={(checked) => updateData({ includeEquipment: checked === true })}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Add equipment and materials list</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.includeCostEstimates}
                    onCheckedChange={(checked) => updateData({ includeCostEstimates: checked === true })}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Include cost estimates</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleExport}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={exportProtocol.isPending}
            >
              {exportProtocol.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Export Protocol
                </>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <i className="fas fa-eye mr-2"></i>
              Export Preview
            </h4>
            
            <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 p-4 text-sm">
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-3">
                {formData.title || 'protocol_export'}.{formData.selectedFormat}
              </div>
              
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <div className="border-b border-slate-200 dark:border-slate-600 pb-2">
                  <h5 className="font-semibold">{formData.title || 'Research Protocol'}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generated by RESAI • {new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h6 className="font-medium text-xs uppercase tracking-wide">Selected Methods</h6>
                  <p className="text-xs">{formData.selectedMethods.length} method(s) selected</p>
                </div>
                
                <div>
                  <h6 className="font-medium text-xs uppercase tracking-wide">Format</h6>
                  <p className="text-xs">{formData.selectedFormat.toUpperCase()} format</p>
                </div>
                
                <div>
                  <h6 className="font-medium text-xs uppercase tracking-wide">Options</h6>
                  <div className="text-xs space-y-1">
                    {formData.includeCitations && <p>✓ Citations included</p>}
                    {formData.includeEquipment && <p>✓ Equipment list included</p>}
                    {formData.includeCostEstimates && <p>✓ Cost estimates included</p>}
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  [Preview - full protocol will include detailed procedures, analysis plans, and supporting materials]
                </div>
              </div>
            </div>

            {/* Recent Exports */}
            <div className="mt-4">
              <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Recent Exports
              </h5>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">No recent exports</span>
                  <span className="text-slate-400">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
