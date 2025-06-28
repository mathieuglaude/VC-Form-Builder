import { Link, useLocation } from "wouter";
import { FileText, Database, Wallet, Users, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Mock user data - in production this would come from auth context
  const currentUser = {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    organization: "Demo Organization",
    profileImage: null
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const navItems = [
    { path: "/builder", label: "Form Builder", icon: FileText },
    { path: "/community", label: "Community Forms", icon: Users },
    { path: "/credentials", label: "Credential Library", icon: Database },
    { path: "/wallets", label: "Wallet Library", icon: Wallet },
  ];

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logout clicked");
  };

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

        {/* Nav and Profile */}
        <div className="flex items-center gap-6">
          {/* Navigation Items */}
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

          {/* User Profile Dropdown */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </div>
            </Button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser.organization}</p>
                </div>
                
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={() => {
                    setLocation('/account');
                    setShowDropdown(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </button>
                
                <div className="border-t my-1"></div>
                
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}