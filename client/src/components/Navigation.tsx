import { Link, useLocation } from "wouter";
import { FileText, Database, Wallet, Users } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/builder", label: "Form Builder", icon: FileText },
    { path: "/community", label: "Community Forms", icon: Users },
    { path: "/credentials", label: "Credential Library", icon: Database },
    { path: "/wallets", label: "Wallet Library", icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/">
          <div className="flex items-center gap-2 text-xl font-semibold cursor-pointer">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-gray-900">Form Builder</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex gap-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                location === path 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}