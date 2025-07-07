import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart } from 'lucide-react';
import FormRenderer from '@/components/FormRenderer';
// Temporarily disable VC feature flag import until build system is fixed
// import { featureFlags } from '../../../packages/shared/src/config';

interface FormPageProps {
  form: any;
  onSubmit?: (formData: Record<string, any>, verifiedFields: Record<string, any>) => void;
  isSubmitting?: boolean;
  showHeader?: boolean; // Controls whether to show header - false for embedded use
  enableVC?: boolean; // Feature flag for VC functionality
}

export default function FormPage({ form, onSubmit, isSubmitting = false, showHeader = true, enableVC = false }: FormPageProps) {
  const [location] = useLocation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  
  // Check if this is preview mode
  const isPreview = new URLSearchParams(location.split('?')[1] || '').has('preview');

  // Check if form needs verification credentials (VC integration)
  function needsVerificationCredentials(form: any): boolean {
    // Only check for VC when feature flag is enabled
    if (!enableVC || typeof window === 'undefined') return false;
    
    // Check environment variable for VC enablement  
    const vcEnabled = import.meta.env.VITE_ENABLE_VC === 'true';
    if (!vcEnabled) return false;
    
    const formSchema = form?.formSchema || form?.formDefinition;
    if (!formSchema?.components) return false;
    
    return formSchema.components.some((component: any) => 
      component.vcConfig?.credentialType && component.vcConfig?.attributeName
    );
  }

  const needsVC = needsVerificationCredentials(form);
  console.log('[FormPage]', form.id, { needsVC, isPreview, enableVC, vcFlag: import.meta.env.VITE_ENABLE_VC });

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleVerificationComplete = (verifiedAttributes: Record<string, any>) => {
    console.log('[FormPage] Verification completed:', verifiedAttributes);
    setVerifiedFields(verifiedAttributes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[FormPage] Form submission:', formData);
    if (onSubmit) {
      onSubmit(formData, verifiedFields);
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const formSchema = form.formSchema || form.formDefinition;

  // Unified form renderer - always use the proven pattern
  const formContent = (
    <FormRenderer
      formSchema={formSchema}
      formData={formData}
      verifiedFields={verifiedFields}
      onFieldChange={handleFieldChange}
      onSubmit={isPreview ? undefined : handleSubmit}
      mode="launch"
      isSubmitting={isSubmitting}
    />
  );

  // Return with or without header/layout based on showHeader prop
  if (!showHeader) {
    return formContent;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8 relative">
          {/* Owner-only submissions link */}
          {(() => {
            // In development, show for demo forms; in production, check actual ownership
            const session = null; // TODO: Replace with actual session when auth is implemented
            const isOwner = session ? form.authorId === (session as any)?.user?.id : (form.authorId === "demo" || form.id <= 100);
            return isOwner;
          })() && (
            <div className="absolute top-0 right-0">
              <Button
                variant="outline" 
                size="sm"
                data-cy="submissions-header-link"
                onClick={() => window.location.href = `/forms/${form.id}/submissions`}
                className="text-blue-600 hover:text-blue-800"
              >
                <BarChart className="h-4 w-4 mr-2" />
                View Submissions
              </Button>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.name || form.title || "Form"}
          </h1>
          {form.purpose && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {form.purpose}
            </p>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {isPreview ? 'Form Preview' : 'Complete the Form'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {formContent}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}