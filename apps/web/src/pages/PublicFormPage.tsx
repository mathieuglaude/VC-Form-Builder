import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ExternalLink } from 'lucide-react';

interface FormConfig {
  id: number;
  name: string;
  slug: string;
  publicSlug: string;
  purpose: string;
  logoUrl?: string;
  formSchema: any;
  metadata?: any;
  hasVerifiableCredentials: boolean;
  publishedAt: string | null;
  isPublished: boolean;
  transport: 'connection' | 'oob' | null;
}

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  // Fetch form configuration by public slug
  const { data: form, isLoading: formLoading, error: formError } = useQuery<FormConfig>({
    queryKey: ['/api/pub-forms', slug],
    queryFn: async () => {
      const response = await fetch(`/api/pub-forms/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        }
        throw new Error('Failed to load form');
      }
      return response.json();
    },
    enabled: !!slug,
    retry: false
  });

  // Loading state
  if (formLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state - Form Not Found
  if (formError || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Form Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The requested form could not be found or is no longer available.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if form has verifiable credentials
  const hasVerifiableCredentials = form.metadata?.fields && 
    Object.values(form.metadata.fields).some((field: any) => 
      field.type === 'verified' || field.dataSource === 'verified'
    );

  const handleStartForm = () => {
    // Navigate to the form launch page (which handles the verification flow)
    navigate(`/launch/${form.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Form Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {form.logoUrl && (
                <img 
                  src={form.logoUrl} 
                  alt={`${form.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <CardTitle className="text-2xl">{form.name}</CardTitle>
                {form.purpose && (
                  <p className="text-gray-600 mt-1">{form.purpose}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <span>Ready to Start</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Complete this form to submit your information securely.
              </p>

              {hasVerifiableCredentials && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Credential Verification Available
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    This form supports automatic field completion using your digital credentials.
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleStartForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Form
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publication Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">
              <Badge variant="secondary" className="mb-2">
                Published Form
              </Badge>
              <p>
                Published: {form.publishedAt ? new Date(form.publishedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}