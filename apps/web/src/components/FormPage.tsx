import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import FormRenderer from '@/components/FormRenderer';

interface FormPageProps {
  form: any;
  mode: 'preview' | 'launch' | 'public';
  onSubmit?: (formData: Record<string, any>, verifiedFields: Record<string, any>) => void;
  isSubmitting?: boolean;
}

export default function FormPage({ form, mode, onSubmit, isSubmitting = false }: FormPageProps) {
  const [location] = useLocation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  
  // Check if this is preview mode
  const isPreview = new URLSearchParams(location.split('?')[1] || '').has('preview');

  console.log('[FormPage]', mode, form.id, { needsVC: needsVerificationCredentials(form), isPreview });

  // Check if form needs verification credentials
  function needsVerificationCredentials(form: any): boolean {
    const formSchema = form?.formSchema || form?.formDefinition;
    if (!formSchema?.components) return false;
    
    return formSchema.components.some((component: any) => 
      component.vcMapping?.credentialType && component.vcMapping?.attributeName
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.name || form.title || "Form"}
          </h1>
          {form.purpose && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {form.purpose}
            </p>
          )}
        </div>

        {/* Note: Verification Panel is now handled at the page level (FormLaunchPage) */}

        {/* Form Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {mode === 'preview' ? 'Form Preview' : 'Complete the Form'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FormRenderer
              formSchema={formSchema}
              formData={formData}
              verifiedFields={verifiedFields}
              onFieldChange={handleFieldChange}
              onSubmit={mode !== 'preview' ? handleSubmit : undefined}
              mode={mode}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}