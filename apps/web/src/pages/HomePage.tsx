import { useLocation } from 'wouter';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, FileText, Edit, ExternalLink, Clock, Filter, X, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForms, useCredentialLibrary } from '@shared/react-query';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Use React Query hooks for data fetching
  const { data: formsData = [], isLoading } = useForms();
  const { data: creds = [] } = useCredentialLibrary();

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



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your forms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">


        {/* My Forms Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Forms</h3>
              <p className="text-gray-600 mt-1">Forms you've created and can edit</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="ml-auto inline-flex items-center gap-1 rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filter&nbsp;Forms
              {filterIds.length > 0 && (
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  {filterIds.length}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Form Card */}
            <Card 
              className="card card-hover border-2 border-dashed border-blue-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/builder/new';
              }}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-48">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create New Form</h3>
                <p className="text-sm text-gray-600 mb-4">Build a new form with VC integration</p>
                <Button onClick={(e) => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  window.location.href = '/builder/new';
                }}>Get Started</Button>
              </CardContent>
            </Card>

            {/* Existing Personal Forms */}
            {formsFiltered.map((form: any) => {
              const isPublished = form.isPublished && form.publicSlug;
              
              return (
                <TooltipProvider key={form.id}>
                  <Card className="card card-hover flex flex-col">
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
                              onClick={() => setLocation(`/builder/${form.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            {/* Submissions button - owner only */}
                            {(() => {
                              // In development, show for demo forms; in production, check actual ownership
                              const session = null; // TODO: Replace with actual session when auth is implemented
                              const isOwner = session ? form.authorId === (session as any)?.user?.id : (form.authorId === "demo" || form.id <= 100);
                              return isOwner;
                            })() && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    data-cy="submissions-link"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/submissions?formId=${form.id}`);
                                    }}
                                  >
                                    <BarChart className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  View submissions
                                </TooltipContent>
                              </Tooltip>
                            )}
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "p-2 rounded-md",
                                    isPublished
                                      ? "hover:bg-slate-100 cursor-pointer text-blue-600"
                                      : "opacity-40 cursor-not-allowed"
                                  )}
                                  onClick={e => {
                                    if (!isPublished) return;
                                    e.stopPropagation();
                                    window.open(`/f/${form.publicSlug}`, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </span>
                              </TooltipTrigger>
                              {!isPublished && (
                                <TooltipContent side="top">
                                  Publish the form to generate a public URL.
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </div>
                        </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.purpose}</p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated last {new Date(form.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          );
          })}
          </div>

          {/* Empty State */}
          {formsFiltered.length === 0 && filterIds.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-500 mb-6">Create your first form to get started with VC integration</p>
              <Button onClick={() => setLocation('/builder/new')}>
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
                <Button onClick={() => setLocation('/builder/new')}>
                  Create New Form
                </Button>
              </div>
            </div>
          )}
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
                      checked={filterIds.includes(c.id.toString())}
                      onChange={e =>
                        setFilterIds(prev =>
                          e.target.checked
                            ? [...prev, c.id.toString()]
                            : prev.filter(id => id !== c.id.toString())
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