import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BuilderPage from "@/pages/BuilderPage";
import FillPage from "@/pages/FillPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BuilderPage} />
      <Route path="/builder" component={BuilderPage} />
      <Route path="/builder/:id" component={BuilderPage} />
      <Route path="/form/:id" component={FillPage} />
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
