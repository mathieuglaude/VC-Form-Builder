import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormPage from '@/components/FormPage';
import VerificationPanel from '@/components/VerificationPanel';

interface FormConfig {
  id: number;
  name: string;
  slug: string;
  purpose: string;
  logoUrl?: string;
  formDefinition: any;
  formSchema: any;
  metadata?: any;
  hasVerifiableCredentials: boolean;
  publishedAt: string | null;
  transport: 'connection' | 'oob' | null;
}

export default function FormLaunchPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [proofId, setProofId] = useState<string | null>(null);

  // Fetch form configuration
  const { data: form, isLoading: formLoading, error: formError } = useQuery<FormConfig>({
    queryKey: ['/api/forms', id],
    queryFn: async () => {
      const response = await fetch(`/api/forms/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        }
        throw new Error('Failed to load form');
      }
      return response.json();
    },
    enabled: !!id,
    retry: false
  });

  // Form submission mutation
  const submitFormMutation = useMutation({
    mutationFn: async (data: { formData: Record<string, any>; verifiedFields: Record<string, any> }) => {
      const submissionData = {
        formConfigId: parseInt(id!),
        data: data.formData,
        verifiedFields: data.verifiedFields,
        metadata: form?.metadata
      };

      const response = await fetch(`/api/forms/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Form submitted successfully',
        description: 'Thank you for your submission!',
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleFormSubmit = (formData: Record<string, any>, verifiedFields: Record<string, any>) => {
    submitFormMutation.mutate({ formData, verifiedFields });
  };

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

  // Error state
  if (formError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">
            The form you're looking for could not be found.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  // Initialize proof request for forms with VC requirements
  const { data: proofResponse } = useQuery({
    queryKey: ['proof-init', id],
    queryFn: async () => {
      const response = await fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: parseInt(id!) })
      });
      if (!response.ok) throw new Error('Failed to initialize proof');
      return response.json();
    },
    enabled: !!form && needsVerificationCredentials(form),
    retry: false
  });

  // Check if form needs verification credentials
  function needsVerificationCredentials(form: any): boolean {
    const formSchema = form?.formSchema || form?.formDefinition;
    if (!formSchema?.components) return false;
    
    return formSchema.components.some((component: any) => 
      component.vcMapping?.credentialType && component.vcMapping?.attributeName
    );
  }

  const hasVCRequirements = needsVerificationCredentials(form);
  const currentProofId = proofResponse?.proofId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {form.name || "Form"}
          </h1>
          {form.purpose && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {form.purpose}
            </p>
          )}
        </div>

        {/* Main Content - Flex Layout */}
        <div className={`flex gap-8 ${hasVCRequirements ? 'flex-col lg:flex-row' : 'justify-center'}`}>
          
          {/* Form Section */}
          <div className={hasVCRequirements ? 'flex-1' : 'max-w-4xl'}>
            <FormPage
              form={form}
              mode="launch"
              onSubmit={handleFormSubmit}
              isSubmitting={submitFormMutation.isPending}
            />
          </div>

          {/* Verification Panel Section */}
          {hasVCRequirements && (
            <div className="lg:w-80 flex-shrink-0">
              {currentProofId ? (
                <VerificationPanel proofId={currentProofId} />
              ) : (
                <div className="w-80 bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Preparing verification...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}