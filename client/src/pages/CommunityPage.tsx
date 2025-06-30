import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const { toast } = useToast();

  // Community forms data (migrated from HomePage)
  const communityForms = [
    {
      id: 1001,
      name: "BC Government Employee Verification",
      slug: "bc-gov-employee-verification",
      purpose: "Verification form for BC government employees using BC Person credentials",
      description: "This form verifies your employment with the BC Government using your digital business card credential.",
      author: "BC Digital Government",
      authorId: "bc-digital-gov",
      logoUrl: null,
      isPublished: true,
      publishedToPublic: true,
      transport: "oob" as const,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      proofDef: { "2": ["given_name", "surname"] }, // BC Person Credential
    },
    {
      id: 1002,
      name: "Legal Professional Directory",
      slug: "legal-professional-directory",
      purpose: "Directory registration for practicing lawyers in BC",
      description: "Directory registration for practicing lawyers using verified BC Lawyer credentials from LSBC.",
      author: "Law Society of BC",
      authorId: "lsbc",
      logoUrl: null,
      isPublished: true,
      publishedToPublic: true,
      transport: "connection" as const,
      createdAt: "2024-01-10T14:30:00Z",
      updatedAt: "2024-01-10T14:30:00Z",
      proofDef: { "3": ["given_name", "surname", "member_status"] }, // BC Lawyer Credential
    },
    {
      id: 1003,
      name: "Business Registration Renewal",
      slug: "business-registration-renewal",
      purpose: "Annual renewal form for BC registered businesses",
      description: "Quick registration for professional services using your BC Person Credential for identity verification.",
      author: "BC Registry Services",
      authorId: "bc-registry",
      logoUrl: null,
      isPublished: true,
      publishedToPublic: true,
      transport: "oob" as const,
      createdAt: "2024-01-05T09:15:00Z",
      updatedAt: "2024-01-20T16:45:00Z",
      proofDef: { "1": ["business_name", "registration_number"] }, // BC Digital Business Card
    },
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const cloneFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      const response = await fetch(`/api/forms/${formId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: 'demo',
          authorName: 'Demo User'
        })
      });
      if (!response.ok) throw new Error('Failed to clone form');
      return response.json();
    },
    onSuccess: (clonedForm) => {
      toast({
        title: 'Form Cloned Successfully',
        description: `"${clonedForm.name}" has been added to your forms.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    },
    onError: () => {
      toast({
        title: 'Clone Failed',
        description: 'Unable to clone the form. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const filteredForms = useMemo(() => {
    return communityForms.filter(form => {
      const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPurpose = purposeFilter === 'all' || form.purpose === purposeFilter;
      return matchesSearch && matchesPurpose;
    });
  }, [communityForms, searchTerm, purposeFilter]);

  const uniquePurposes = Array.from(new Set(communityForms.map(form => form.purpose)));

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleCloneForm = (form: any) => {
    cloneFormMutation.mutate(form.id);
  };

  const handleViewForm = (form: any) => {
    window.open(`/f/${form.slug}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Forms</h1>
          <p className="text-gray-600">
            Discover and clone forms shared by the community. Find templates for common use cases and customize them for your needs.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={purposeFilter} onValueChange={setPurposeFilter}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purposes</SelectItem>
              {uniquePurposes.map(purpose => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {communityForms.length === 0 
                ? "No public forms available yet. Be the first to publish a form!"
                : "No forms match your search criteria."
              }
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Form Header */}
                  <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-t-lg p-4 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-green-600" />
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{form.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewForm(form)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.purpose}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>by {form.author}</span>
                      <span>{formatTimeAgo(form.updatedAt)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewForm(form)}
                      >
                        Try Form
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCloneForm(form)}
                        disabled={cloneFormMutation.isPending}
                      >
                        {cloneFormMutation.isPending ? 'Cloning...' : 'Clone'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}