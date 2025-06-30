import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import BuilderPage from "@/pages/BuilderPage";
import FillPage from "@/pages/FillPage";
import CredentialsPage from "@/pages/CredentialsPage";
import CredentialDetailPage from "@/pages/CredentialDetailPage";
import WalletLibraryPage from "@/pages/WalletLibraryPage";
import CommunityPage from "@/pages/CommunityPage";
import AccountPage from "@/pages/AccountPage";
import CredentialsAdminPage from "@/pages/CredentialsAdminPage";

function Router() {
  // Fix URL encoding issues by redirecting malformed paths to root
  if (window.location.pathname === '/%22' || window.location.pathname.includes('%')) {
    window.history.replaceState({}, '', '/');
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/builder" component={() => { window.location.href = "/"; return null; }} />
      <Route path="/builder/:id" component={BuilderPage} />
      <Route path="/form/:id" component={FillPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/credentials" component={CredentialsPage} />
      <Route path="/credentials/:id" component={CredentialDetailPage} />
      <Route path="/wallets" component={WalletLibraryPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin/credentials" component={CredentialsAdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="test-tailwind-loaded fixed top-2 right-2" />
        <div className="hidden grid rounded-lg bg-slate-50 p-4 border shadow-md"></div>
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
