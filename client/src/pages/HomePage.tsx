import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, ExternalLink, Shield, Users, Clock, TrendingUp, Filter, X } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const { data: formsData = [], isLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const { data: creds = [] } = useQuery({
    queryKey: ['/api/cred-lib'],
  });

  // Re-validate every minute so "Updated last" moves cards to show recent changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [queryClient]);

  // Load saved filter preferences
  useEffect(() => {
    const saved = localStorage.getItem('formFilters');
    if (saved) {
      try {
        setFilterIds(JSON.parse(saved));
      } catch (e) {
        // Ignore malformed data
      }
    }
  }, []);

  // Save filter preferences
  useEffect(() => {
    localStorage.setItem('formFilters', JSON.stringify(filterIds));
  }, [filterIds]);

  const forms = Array.isArray(formsData) ? formsData : [];

  // Filter logic - forms must require ALL selected credentials
  const formsFiltered = useMemo(() => {
    if (!filterIds.length) return forms.filter((form: any) => form.authorId === "demo" || form.id <= 100);
    
    const personalForms = forms.filter((form: any) => form.authorId === "demo" || form.id <= 100);
    
    return personalForms.filter((form: any) => {
      // Check if form requires ALL selected credentials using proofDef
      if (!form.proofDef || typeof form.proofDef !== 'object') return false;
      
      const formCredentialIds = Object.keys(form.proofDef);
      return filterIds.every(id => formCredentialIds.includes(id));
    });
  }, [forms, filterIds]);

  // Community forms (sample forms with higher IDs that represent community content), sorted by most recent updates
  const communityForms = [
    {
      id: 1001,
      name: "BC Government Employee Verification",
      slug: "bc-gov-employee-verification",
      purpose: "Verification form for BC government employees using BC Person credentials",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your verifiable credential forms and monitor activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Forms</p>
                  <p className="text-2xl font-bold text-gray-900">{formsFiltered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Forms Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Forms</h3>
              <p className="text-gray-600 mt-1">Forms you've created and can edit</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              TEST FILTER BUTTON
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Form Card */}
            <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-48">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create New Form</h3>
                <p className="text-sm text-gray-600 mb-4">Build a new form with VC integration</p>
                <Button onClick={() => setLocation('/builder')}>Get Started</Button>
              </CardContent>
            </Card>

            {/* Existing Personal Forms */}
            {formsFiltered.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Form Header with Logo */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg p-4 flex items-center justify-center">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Form logo" className="h-16 w-auto object-contain" />
                    ) : (
                      <FileText className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{form.name}</h3>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/builder/${form.slug}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.purpose}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Updated last {new Date(form.updatedAt).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {Math.floor(Math.random() * 50)} views
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {formsFiltered.length === 0 && filterIds.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-500 mb-6">Create your first form to get started with VC integration</p>
              <Button onClick={() => setLocation('/builder')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </div>
          )}

          {/* Filtered Empty State */}
          {formsFiltered.length === 0 && filterIds.length > 0 && (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms match your filters</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your credential filters or create a new form
              </p>
              <div className="space-x-4">
                <Button variant="outline" onClick={() => setFilterIds([])}>
                  Clear Filters
                </Button>
                <Button onClick={() => setLocation('/builder')}>
                  Create New Form
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Community Forms Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Community Forms</h3>
              <p className="text-gray-600 mt-1">Discover and clone forms created by the community</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/community')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityForms.slice(0, 3).map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Form Header */}
                  <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-t-lg p-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{form.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/f/${form.slug}`, '_blank')}
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
                        onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                      >
                        Try Form
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Clone form functionality would go here
                          alert('Clone functionality coming soon!');
                        }}
                      >
                        Clone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plain HTML Modal */}
        {open && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="w-80 rounded bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">Filter by Credential</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.isArray(creds) && creds.map((c: any) => (
                  <label key={c.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterIds.includes(c.id)}
                      onChange={e =>
                        setFilterIds(prev =>
                          e.target.checked
                            ? [...prev, c.id]
                            : prev.filter(id => id !== c.id)
                        )
                      }
                    />
                    {c.branding?.logoUrl && (
                      <img src={c.branding.logoUrl} className="h-5 w-5 rounded" />
                    )}
                    <span className="text-sm">{c.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setFilterIds([])}
                  className="text-xs text-gray-500 underline"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded bg-blue-600 px-4 py-1 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}