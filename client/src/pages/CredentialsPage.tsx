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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template: CredentialTemplate) => (
          <Link key={template.id} href={`/credentials/${template.id}`}>
            <Card className="relative group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.label}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <CardDescription>Version {template.version}</CardDescription>
                      {template.isPredefined && (
                        <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                          BC Government
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Issuer DID</p>
                  <p className="text-xs text-gray-500 font-mono break-all">
                    {template.issuerDid}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Attributes</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.attributes.slice(0, 3).map((attr, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {attr.name}
                      </Badge>
                    ))}
                    {template.attributes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.attributes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Ecosystem and Interop Profile */}
                {(template.ecosystem || template.interopProfile) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Technical Details</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.ecosystem && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {template.ecosystem}
                        </Badge>
                      )}
                      {template.interopProfile && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {template.interopProfile}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Wallet Compatibility */}
                {(template.walletRestricted || (template.compatibleWallets && template.compatibleWallets.length > 0)) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Wallet Compatibility</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.walletRestricted && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Restricted
                        </Badge>
                      )}
                      {template.compatibleWallets && template.compatibleWallets.map((wallet: string) => (
                        <Badge key={wallet} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          {wallet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.schemaUrl && (
                  <div>
                    <a
                      href={template.schemaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Documentation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>

            </Card>
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