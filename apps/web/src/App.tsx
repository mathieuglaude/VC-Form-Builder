import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import BuilderPage from "@/pages/BuilderPage";
import FillPage from "@/pages/FillPage";
import FormLaunchPage from "@/pages/FormLaunchPage";
import CredentialsPage from "@/pages/CredentialsPage";
import CredentialDetailPage from "@/pages/CredentialDetailPage";
import WalletLibraryPage from "@/pages/WalletLibraryPage";
import CommunityPage from "@/pages/CommunityPage";
import AccountPage from "@/pages/AccountPage";
import CredentialsAdminPage from "@/pages/CredentialsAdminPage";
import PublicFormPage from "@/pages/PublicFormPage";

function Router() {
  // Fix URL encoding issues by redirecting malformed paths to root
  if (window.location.pathname === '/%22' || window.location.pathname.includes('%')) {
    window.history.replaceState({}, '', '/');
  }

  return (
    <Switch>
      <Route path="/"><HomePage /></Route>
      <Route path="/builder">
        {() => { window.location.href = "/"; return null; }}
      </Route>
      <Route path="/builder/:id"><BuilderPage /></Route>
      <Route path="/launch/:id"><FormLaunchPage /></Route>
      <Route path="/form/:id"><FillPage /></Route>
      <Route path="/f/:slug"><PublicFormPage /></Route>
      <Route path="/community"><CommunityPage /></Route>
      <Route path="/credentials"><CredentialsPage /></Route>
      <Route path="/credentials/:id"><CredentialDetailPage /></Route>
      <Route path="/wallets"><WalletLibraryPage /></Route>
      <Route path="/account"><AccountPage /></Route>
      <Route path="/admin/credentials"><CredentialsAdminPage /></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="test-tailwind-loaded fixed top-2 right-2" />
      <div className="hidden grid rounded-lg bg-slate-50 p-4 border shadow-md"></div>
      <Navigation />
      <main className="pt-4">
        <Router />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
