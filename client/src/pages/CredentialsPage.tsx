import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, ExternalLink, Filter, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CredentialModal from "@/components/CredentialModal";
import type { CredentialTemplate } from "@shared/schema";

export default function CredentialsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CredentialTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ecosystemFilter, setEcosystemFilter] = useState<string>("all");
  const [interopFilter, setInteropFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/cred-lib/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cred-lib'] });
      toast({
        title: "Template deleted",
        description: "Credential template has been removed successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete credential template.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (template: CredentialTemplate) => {
    if (template.isPredefined) {
      toast({
        title: "Cannot Edit",
        description: "Predefined BC Government credentials cannot be edited.",
        variant: "destructive"
      });
      return;
    }
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this credential template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
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
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Credential
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
          <Card key={template.id} className="relative group">
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
                <Badge variant="secondary">Active</Badge>
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

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(template)}
                  disabled={template.isPredefined}
                  className="h-8 w-8 p-0"
                  title={template.isPredefined ? "BC Government credentials cannot be edited" : "Edit credential"}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(template.id)}
                  disabled={template.isPredefined}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 disabled:text-gray-400"
                  title={template.isPredefined ? "BC Government credentials cannot be deleted" : "Delete credential"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No credential templates yet</p>
              <p className="text-sm">
                Create your first template to start using verified credentials in forms
              </p>
            </div>
          </div>
        )}
      </div>

      <CredentialModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        template={editingTemplate}
      />
    </div>
  );
}