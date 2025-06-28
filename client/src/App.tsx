import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import BuilderPage from "@/pages/BuilderPage";
import FillPage from "@/pages/FillPage";
import CredentialsPage from "@/pages/CredentialsPage";
import CredentialDetailPage from "@/pages/CredentialDetailPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BuilderPage} />
      <Route path="/builder" component={BuilderPage} />
      <Route path="/builder/:id" component={BuilderPage} />
      <Route path="/form/:id" component={FillPage} />
      <Route path="/credentials" component={CredentialsPage} />
      <Route path="/credentials/:id" component={CredentialDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-4">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
