import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Database, Home, Plus, BarChart3 } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/builder", label: "Builder", icon: FileText },
    { path: "/credentials", label: "Credentials", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/">
          <div className="flex items-center gap-2 text-xl font-semibold cursor-pointer">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-gray-900">Form Builder Pro</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex gap-6">
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

        {/* CTA */}
        <Button
          onClick={() => setLocation('/builder')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </div>
    </header>
  );
}