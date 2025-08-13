import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { HypothesisGenerator } from "./hypothesis-generator";
import { MethodsRecommender } from "@/components/methods-recommender";
import { SampleSizeCalculator } from "@/components/sample-size-calculator";
import { CitationVerifier } from "@/components/citation-verifier";
import { ProtocolExporter } from "@/components/protocol-exporter";

export default function Dashboard() {
  const [location] = useLocation();

  const getPageTitle = () => {
    switch (location) {
      case "/hypothesis":
        return "Hypothesis Generator";
      case "/methods":
        return "Research Methods Recommender";
      case "/sample-size":
        return "Sample Size Calculator";
      case "/citations":
        return "Citation Verifier";
      case "/protocols":
        return "Protocol Exporter";
      default:
        return "Research Methods Recommender";
    }
  };

  const getPageDescription = () => {
    switch (location) {
      case "/hypothesis":
        return "Generate evidence-linked research hypotheses using AI and scientific literature";
      case "/methods":
        return "Generate evidence-based research methods for your study";
      case "/sample-size":
        return "Calculate required sample sizes for statistical power analysis";
      case "/citations":
        return "Verify research claims against published literature";
      case "/protocols":
        return "Export research protocols to lab-friendly formats";
      default:
        return "Generate evidence-based research methods for your study";
    }
  };

  const renderContent = () => {
    switch (location) {
      case "/hypothesis":
        return <HypothesisGenerator />;
      case "/methods":
        return <MethodsRecommender />;
      case "/sample-size":
        return <SampleSizeCalculator />;
      case "/citations":
        return <CitationVerifier />;
      case "/protocols":
        return <ProtocolExporter />;
      default:
        return <MethodsRecommender />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{getPageTitle()}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{getPageDescription()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                <i className="fas fa-bell"></i>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
