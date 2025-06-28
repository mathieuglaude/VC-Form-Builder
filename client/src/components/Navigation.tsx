import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Database, Home, Plus } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/credentials", label: "Credentials", icon: Database },
  ];

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Form Builder Pro</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path}>
                  <Button
                    variant={location === path ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <Button
            onClick={() => setLocation('/builder')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>
      </div>
    </nav>
  );
}