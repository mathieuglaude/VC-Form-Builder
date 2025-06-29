import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExternalLink, Filter, X, ChevronRight } from "lucide-react";
import type { CredentialTemplate } from "@shared/schema";
import BannerBottomCard from "@/components/BannerBottomCard";
import DefaultCard from "@/components/DefaultCard";

export default function CredentialsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ecosystemFilter, setEcosystemFilter] = useState<string>("all");
  const [interopFilter, setInteropFilter] = useState<string>("all");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/cred-lib'],
    queryFn: async () => {
      const response = await fetch('/api/cred-lib');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Extract unique ecosystems and interop profiles for filter dropdowns
  const uniqueEcosystems = useMemo(() => {
    const ecosystems = templates
      .map((template: CredentialTemplate) => template.ecosystem)
      .filter((ecosystem: string | null): ecosystem is string => Boolean(ecosystem));
    return Array.from(new Set(ecosystems));
  }, [templates]);

  const uniqueInteropProfiles = useMemo(() => {
    const profiles = templates
      .map((template: CredentialTemplate) => template.interopProfile)
      .filter((profile: string | null): profile is string => Boolean(profile));
    return Array.from(new Set(profiles));
  }, [templates]);

  // Filter templates based on search term, ecosystem, and interop profile
  const filteredTemplates = useMemo(() => {
    return templates.filter((template: CredentialTemplate) => {
      const matchesSearch = template.label.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEcosystem = ecosystemFilter === "all" || template.ecosystem === ecosystemFilter;
      
      const matchesInterop = interopFilter === "all" || template.interopProfile === interopFilter;
      
      return matchesSearch && matchesEcosystem && matchesInterop;
    });
  }, [templates, searchTerm, ecosystemFilter, interopFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setEcosystemFilter("all");
    setInteropFilter("all");
  };



  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Credential Library</h1>
          <p className="text-gray-600 mt-2">
            Manage reusable credential templates for form verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="ecosystem">Ecosystem</Label>
                <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All ecosystems" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ecosystems</SelectItem>
                    {uniqueEcosystems.map((ecosystem) => (
                      <SelectItem key={ecosystem} value={ecosystem}>
                        {ecosystem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interop">Interop Profile</Label>
                <Select value={interopFilter} onValueChange={setInteropFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All profiles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    {uniqueInteropProfiles.map((profile) => (
                      <SelectItem key={profile} value={profile}>
                        {profile}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
            
            {/* Active filters summary */}
            {(searchTerm || ecosystemFilter !== "all" || interopFilter !== "all") && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                  )}
                  {ecosystemFilter !== "all" && (
                    <Badge variant="secondary">Ecosystem: {ecosystemFilter}</Badge>
                  )}
                  {interopFilter !== "all" && (
                    <Badge variant="secondary">Interop: {interopFilter}</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 auto-cols-[420px] md:grid-cols-2 lg:grid-cols-3 justify-center">
        {filteredTemplates.map((template: CredentialTemplate) => (
          <Link key={template.id} href={`/credentials/${template.id}`}>
            {template.branding?.layout === 'banner-bottom' ? (
              <div className="group hover:scale-105 transition-transform cursor-pointer mx-auto">
                <BannerBottomCard credential={template} />
              </div>
            ) : (
              <Card className="relative group hover:shadow-lg transition-shadow cursor-pointer w-[420px] mx-auto">
                <DefaultCard credential={template} />
              </Card>
            )}
          </Link>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No credential templates found</p>
              <p className="text-sm">
                {templates.length === 0 ? 
                  "The credential library is currently empty" : 
                  "Try adjusting your filters to see more results"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}