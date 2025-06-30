import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import VCModal from "@/components/VCModal";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Send, Loader2, Image, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PreviewPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  const [vcModal, setVcModal] = useState<null | { txId: string; qr: string }>(null);


  // Fetch form configuration by slug
  const { data: formConfig, isLoading, error } = useQuery({
    queryKey: [`/api/forms/slug/${slug}`],
    enabled: !!slug
  });

  // Submit form mutation
  const submitFormMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await apiRequest('POST', `/api/forms/${(formConfig as any)?.id}/submit`, submissionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form submitted successfully!"
      });
      setFormData({});
      setVerifiedFields({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive"
      });
    }
  });

  // Check if form requires VC verification and trigger modal  
  useEffect(() => {
    if (formConfig && !vcModal) {
      const config = formConfig as any;
      const needsVc = config?.formSchema?.components?.some((c: any) => c.properties?.dataSource === 'verified');
      
      if (needsVc) {
        fetch('/api/proofs/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId: config.id })
        })
          .then(r => r.json())
          .then(setVcModal);
      }
    }
  }, [formConfig, vcModal]);

  const handleVerificationSuccess = (attributes: Record<string, any>) => {
    setVerifiedFields(attributes);
    
    // Auto-populate form fields with verified attributes
    const newFormData = { ...formData };
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    
    Object.entries(metadata?.fields || {}).forEach(([fieldKey, fieldMeta]: [string, any]) => {
      if (fieldMeta.type === 'verified' && fieldMeta.vcMapping) {
        const attributeName = fieldMeta.vcMapping.attributeName;
        if (attributes[attributeName]) {
          newFormData[fieldKey] = attributes[attributeName];
        }
      }
    });
    
    setFormData(newFormData);
  };

  const handleInputChange = (fieldKey: string, value: any) => {
    // Don't allow editing verified fields
    if (verifiedFields[fieldKey] !== undefined) return;
    
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    const components = config?.formSchema?.components || [];
    
    for (const component of components) {
      if (component.validate?.required && !formData[component.key] && verifiedFields[component.key] === undefined) {
        toast({
          title: "Validation Error",
          description: `${component.label} is required`,
          variant: "destructive"
        });
        return;
      }
    }

    submitFormMutation.mutate({
      submissionData: formData,
      verifiedFields
    });
  };

  const hasVerifiedFields = () => {
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    return Object.values(metadata?.fields || {}).some((field: any) => field.type === 'verified');
  };

  const isFieldVerified = (fieldKey: string) => {
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    const fieldMeta = metadata?.fields?.[fieldKey];
    
    if (fieldMeta?.type === 'verified' && fieldMeta.vcMapping) {
      const attributeName = fieldMeta.vcMapping.attributeName;
      return verifiedFields[attributeName] !== undefined;
    }
    
    return false;
  };

  const getFieldValue = (fieldKey: string) => {
    const config = formConfig as any;
    const metadata = config?.metadata as any;
    const fieldMeta = metadata?.fields?.[fieldKey];
    
    if (fieldMeta?.type === 'verified' && fieldMeta.vcMapping) {
      const attributeName = fieldMeta.vcMapping.attributeName;
      return verifiedFields[attributeName] || formData[fieldKey] || '';
    }
    
    return formData[fieldKey] || '';
  };

  // Auto-launch VCModal when form contains VC fields
  useEffect(() => {
    if (formConfig && !vcModal) {
      const config = formConfig as any;
      const formContainsVC = config?.formSchema?.components?.some((c: any) => 
        c.properties?.dataSource === 'verified'
      );
      
      if (formContainsVC) {
        fetch('/api/proofs/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId: config.id })
        })
          .then(r => r.json())
          .then(setVcModal)
          .catch(console.error);
      }
    }
  }, [formConfig, vcModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or has been removed.</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          {/* Form Fields */}
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
                      placeholder={`Enter ${component.label.toLowerCase()}`}
                      rows={3}
                      disabled={isVerified}
                      className={isVerified ? 'border-green-300 bg-white' : ''}
                    />
                  ) : component.type === 'checkbox' ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fieldValue === true || fieldValue === 'true'}
                        onCheckedChange={(checked) => handleInputChange(component.key, checked)}
                        disabled={isVerified}
                      />
                      <label className="text-sm text-gray-700">
                        {component.label}
                      </label>
                    </div>
                  ) : (
                    <Input
                      type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                      value={fieldValue}
                      onChange={(e) => handleInputChange(component.key, e.target.value)}
                      placeholder={`Enter ${component.label.toLowerCase()}`}
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

      {/* VC Verification Modal */}
      {vcModal && (
        <VCModal
          {...vcModal}
          onVerified={() => {
            setVcModal(null);
            // TODO: patch Form.io fields in next iteration
          }}
        />
      )}
    </div>
  );
}