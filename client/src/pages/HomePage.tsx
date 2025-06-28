import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Eye, Shield, Users, Clock, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();

  const { data: formsData = [], isLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const forms = Array.isArray(formsData) ? formsData : [];

  const getFormUrl = (form: any) => {
    return `${window.location.origin}/f/${form.slug}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Dashboard</h2>
        <p className="text-gray-600">
          Create and manage forms with verifiable credential integration. 
          Build professional forms that auto-populate verified data.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forms.reduce((acc: number, form: any) => acc + (form.submissions || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VC-Enabled Forms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forms.filter((form: any) => form.metadata && Object.keys(form.metadata).length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Your Forms</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Form Card */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 cursor-pointer transition-colors" onClick={() => setLocation('/builder/new')}>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Form</h3>
              <p className="text-sm text-gray-500">Start building a new form with VC integration</p>
            </CardContent>
          </Card>

          {/* Existing Forms */}
          {forms.map((form: any) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Form Header with Logo */}
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg p-4 flex items-center justify-center">
                  {form.logoUrl ? (
                    <img 
                      src={form.logoUrl} 
                      alt={form.name} 
                      className="h-16 w-16 object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{form.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{form.purpose || 'No description provided'}</p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/builder/${form.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/preview/${form.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    <span>0 submissions</span>
                  </div>

                  {/* VC Requirements Badge */}
                  {form.metadata?.vcRequirements && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        VC Required
                      </span>
                    </div>
                  )}

                  {/* Public URL */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Public URL:</p>
                    <code className="text-blue-600 break-all">{getFormUrl(form)}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {forms.length === 0 && (
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
      </div>
    </div>
  );
}