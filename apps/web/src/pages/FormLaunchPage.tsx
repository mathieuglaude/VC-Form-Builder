import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import FormPage from '@/components/FormPage';
import VerificationPanel from '@/components/VerificationPanel';
import { useToast } from '@/hooks/use-toast';
import { useProofRequest, mockProof } from '@/hooks/useProofRequest';

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
  
  // Parse URL query parameters for preview mode
  const qs = new URLSearchParams(location.search);
  const isPreview = qs.get('preview') === '1';
  const urlShowPanel = qs.get('panel') === '1';

  // Helper function - not a hook
  function formHasVCFields(form: any): boolean {
    // First try the hasVerifiableCredentials flag if available
    if (form?.hasVerifiableCredentials !== undefined) {
      return form.hasVerifiableCredentials;
    }
    
    const formSchema = form?.formSchema || form?.formDefinition;
    if (!formSchema?.components) return false;
    
    return formSchema.components.some((component: any) => 
      component.vcMapping?.credentialType && component.vcMapping?.attributeName
    );
  }

  // ALL HOOKS MUST BE CALLED AT TOP LEVEL
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

  // TEMPORARILY DISABLE VC LOGIC FOR TESTING
  const hasVC = false; // formHasVCFields(form);

  // Initialize proof request hook - MUST be at top level
  const { data: proofResponse, isLoading: proofLoading } = useProofRequest({
    formId: id,
    enabled: false // !!form && hasVC
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

  // HARD-LOCKED PREVIEW: Always render form, dev toggle for panel
  const debugShowPanel = isPreview && urlShowPanel;

  // DEBUG LOGGING: Track verification panel decision
  console.log('[FormLaunchPage]', {
    mode: isPreview ? 'preview' : 'launch',
    isPreview,
    urlShowPanel,
    debugShowPanel,
    hasVC: false, // Currently disabled for testing
  });

  // Hard-locked return: always render form body
  return (
    <>
      <FormPage
        form={form}
        mode={isPreview ? "preview" : "launch"}
        onSubmit={!isPreview ? handleFormSubmit : undefined}
        isSubmitting={!isPreview ? submitFormMutation.isPending : false}
        showHeader={true}
      />

      {/* Dev toggle: add panel when preview=1&panel=1 */}
      {debugShowPanel && (
        <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <VerificationPanel proofId={mockProof.proofId} />
        </div>
      )}
    </>
  );
}