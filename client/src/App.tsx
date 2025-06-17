import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MiningDashboard from "@/pages/mining-dashboard";
import SimulationDashboard from "@/pages/simulation-dashboard";
import SecureMiningDashboard from "@/pages/secure-mining-dashboard";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { PlayCircle, Shield, Activity, Pickaxe } from "lucide-react";

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Educational Mining", icon: Pickaxe },
    { path: "/simulation", label: "Simulation", icon: Activity },
    { path: "/secure", label: "Advanced Features", icon: Shield },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold text-white">CryptoMiner Pro</h1>
          </div>
          <div className="flex gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <Button
                  variant={location === path ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${
                    location === path 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <Switch>
        <Route path="/" component={MiningDashboard} />
        <Route path="/simulation" component={SimulationDashboard} />
        <Route path="/secure" component={SecureMiningDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
