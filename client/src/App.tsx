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

function Router() {
  return (
    <Switch>
      <Route path="/" component={MiningDashboard} />
      <Route component={NotFound} />
    </Switch>
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
