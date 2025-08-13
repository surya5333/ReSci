import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { 
      name: "Hypothesis Generator", 
      href: "/hypothesis", 
      icon: "fas fa-lightbulb"
    },
    { 
      name: "Methods Recommender", 
      href: "/methods", 
      icon: "fas fa-flask"
    },
    { 
      name: "Sample Size Calculator", 
      href: "/sample-size", 
      icon: "fas fa-calculator"
    },
    { 
      name: "Citation Verifier", 
      href: "/citations", 
      icon: "fas fa-check-circle"
    },
    { 
      name: "Protocol Exporter", 
      href: "/protocols", 
      icon: "fas fa-file-export"
    }
  ];

  return (
    <div className={cn("w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 flex flex-col", className)}>
      {/* Logo & Brand */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-microscope text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">RESAI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Research Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const isDisabled = item.disabled;
          
          if (isDisabled) {
            return (
              <div 
                key={item.name}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 dark:text-slate-600 cursor-not-allowed"
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.name}</span>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}>
                <i className={`${item.icon} w-5`}></i>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-slate-600 dark:text-slate-300 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. Sarah Chen</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Researcher</p>
          </div>
        </div>
      </div>
    </div>
  );
}
