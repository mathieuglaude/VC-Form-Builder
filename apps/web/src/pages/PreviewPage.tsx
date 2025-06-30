import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Send, ArrowLeft, Loader2 } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function PreviewPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  const [vcModal, setVcModal] = useState<{ reqId: string; qr: string } | null>(null);

  // Fetch form configuration
  const { data: formConfig, isLoading } = useQuery({
    queryKey: ['/api/forms/slug', slug],
    enabled: !!slug,
  });

  // No auto-trigger - user must click "Start Verification" button

  // Submit form mutation
  const submitFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/forms/${formConfig.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit form');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Form submitted successfully',
        description: 'Thank you for your submission!',
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize form data and check for VC requirements
  useEffect(() => {
    if (formConfig && hasVerifiedFields()) {
      // Auto-trigger credential verification for forms with VC fields
      fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: formConfig.id })
      })
        .then(r => r.json())
        .then(result => {
          if (result.reqId && result.qr) {
            setVcModal(result);
            // Start polling for verification status
            pollForVerification(result.reqId);
          }
        })
        .catch(console.error);
    }
  }, [formConfig]);

  // Poll for verification status
  const pollForVerification = (reqId: string) => {
    const poll = () => {
      fetch(`/api/proofs/${reqId}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'presentation_verified') {
            setVerifiedFields(data.attributes || {});
            setVcModal(null);
            toast({
              title: 'Credentials verified',
              description: 'Your form has been auto-filled with verified data.',
            });
          } else {
            setTimeout(poll, 3000); // Poll every 3 seconds
          }
        })
        .catch(console.error);
    };
    poll();
  };

  const hasVerifiedFields = () => {
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    if (!metadata?.fields) return false;
    
    return Object.values(metadata.fields).some((field: any) => field.type === 'verified');
  };

  const isFieldVerified = (key: string) => {
    return key in verifiedFields;
  };

  const getFieldValue = (key: string) => {
    return verifiedFields[key] || formData[key] || '';
  };

  const handleInputChange = (key: string, value: any) => {
    if (!isFieldVerified(key)) {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, ...verifiedFields };
    submitFormMutation.mutate(finalData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h2>
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {(formConfig as any)?.logoUrl && (
                <img 
                  src={(formConfig as any).logoUrl} 
                  alt={(formConfig as any).name} 
                  className="h-8 w-8 object-contain"
                />
              )}
              <h1 className="text-xl font-medium text-gray-900">{(formConfig as any)?.name || (formConfig as any)?.title}</h1>
            </div>
            {hasVerifiedFields() && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Ready for verification
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Re-trigger proof request
                    const config = formConfig as any;
                    fetch('/api/proofs/init', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ formId: config.id })
                    })
                      .then(r => r.json())
                      .then(setVcModal);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Credentials
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {(formConfig as any)?.logoUrl && (
              <div className="mb-6">
                <img 
                  src={(formConfig as any).logoUrl} 
                  alt={(formConfig as any).name} 
                  className="h-24 w-24 mx-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{(formConfig as any)?.name || (formConfig as any)?.title}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {(formConfig as any)?.purpose || (formConfig as any)?.description || "Please complete this form"}
            </p>
            {hasVerifiedFields() && Object.keys(verifiedFields).length === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-yellow-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  This form contains verified fields that will be auto-filled using your verifiable credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {(formConfig as any)?.formSchema?.components?.map((component: any) => {
                  const config = formConfig as any;
                  const metadata = config?.metadata as any;
                  const fieldMeta = metadata?.fields?.[component.key] || { type: 'freetext' };
                  const isVerified = isFieldVerified(component.key);
                  const fieldValue = getFieldValue(component.key);

                  return (
                    <div key={component.key} className={`${isVerified ? 'p-4 bg-green-50 border border-green-200 rounded-lg' : ''}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {component.label}
                        {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
                        {isVerified && <VerifiedBadge className="ml-2" />}
                      </label>

                      {/* Render appropriate input based on component type */}
                      {component.type === 'select' || fieldMeta.type === 'picklist' ? (
                        <Select 
                          value={fieldValue} 
                          onValueChange={(value) => handleInputChange(component.key, value)}
                          disabled={isVerified}
                        >
                          <SelectTrigger className={isVerified ? 'border-green-300 bg-white' : ''}>
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(fieldMeta.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : component.type === 'textarea' ? (
                        <Textarea
                          value={fieldValue}
                          onChange={(e) => handleInputChange(component.key, e.target.value)}
                          placeholder={component.placeholder}
                          disabled={isVerified}
                          className={isVerified ? 'border-green-300 bg-white' : ''}
                        />
                      ) : (
                        <Input
                          type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                          value={fieldValue}
                          onChange={(e) => handleInputChange(component.key, e.target.value)}
                          placeholder={component.placeholder}
                          disabled={isVerified}
                          className={isVerified ? 'border-green-300 bg-white' : ''}
                        />
                      )}

                      {/* Field source indicator */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Data Source: {
                            isVerified ? `Verified Attribute (${fieldMeta.vcMapping?.credentialType})` :
                            fieldMeta.type === 'picklist' ? 'Pick List' :
                            fieldMeta.type === 'verified' ? 'Verified Attribute' :
                            'Free Text'
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitFormMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitFormMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Form
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* QR Code Section */}
          {vcModal && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Scan with BC Wallet
                  </h3>
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={vcModal.qr} 
                      alt="QR Code for credential verification"
                      className="w-48 h-48 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Use your BC Wallet app to scan this QR code and present your credentials.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVcModal(null)}
                      className="w-full"
                    >
                      Cancel Verification
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Help Section when no QR */}
          {!vcModal && hasVerifiedFields() && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Credential Verification
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This form requires verified credentials. Click below to start the verification process.
                  </p>
                  <Button
                    onClick={() => {
                      const config = formConfig as any;
                      fetch('/api/proofs/init', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ formId: config.id })
                      })
                        .then(r => r.json())
                        .then(setVcModal)
                        .catch(console.error);
                    }}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Start Verification
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}