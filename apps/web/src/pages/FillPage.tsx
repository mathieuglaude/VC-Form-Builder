import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
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
import { Shield, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function FillPage() {
  const { id } = useParams();
  const [location] = useLocation();
  const { toast } = useToast();
  
  console.log('FillPage: Rendering with ID:', id);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  const [vcModal, setVcModal] = useState<null | { txId: string; qr: string }>(null);

  // Extract verified attributes from navigation state
  const locationState = (location as any)?.state || {};
  const verifiedAttrs = locationState?.verifiedAttrs || {};

  // Fetch form configuration
  const { data: formConfig, isLoading } = useQuery({
    queryKey: [`/api/forms/${id}`],
    queryFn: async () => {
      console.log('FillPage: Fetching form config for ID:', id);
      const response = await fetch(`/api/forms/${id}`);
      if (!response.ok) throw new Error('Form not found');
      const data = await response.json();
      console.log('FillPage: Form config loaded:', data);
      return data;
    },
    enabled: !!id
  });

  // Auto-populate form with verified attributes when form config is loaded
  useEffect(() => {
    if (formConfig && Object.keys(verifiedAttrs).length > 0) {
      console.log('Auto-populating form with verified attributes:', verifiedAttrs);
      
      const newFormData = { ...formData };
      const config = formConfig as any;
      const formSchema = config?.formSchema || {};
      const components = formSchema.components || [];
      
      // Map verified attributes to form fields
      components.forEach((component: any) => {
        if (component.vcMapping?.attributeName && verifiedAttrs[component.vcMapping.attributeName]) {
          newFormData[component.key] = verifiedAttrs[component.vcMapping.attributeName];
        }
      });
      
      setFormData(newFormData);
      setVerifiedFields(verifiedAttrs);
    }
  }, [formConfig, verifiedAttrs]);

  // Submit form mutation
  const submitFormMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await apiRequest('POST', `/api/forms/${id}/submit`, submissionData);
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

  // No auto-trigger - user must click "Start Verification" button

  const handleVerificationSuccess = (attributes: Record<string, any>) => {
    setVerifiedFields(attributes);
    
    // Auto-populate form fields with verified attributes
    const newFormData = { ...formData };
    const config = formConfig as any;
    const metadata = config?.metadata;
    
    Object.entries(metadata?.fields || {}).forEach(([fieldKey, fieldMeta]: [string, any]) => {
      if (fieldMeta?.dataSource === 'verified' && fieldMeta?.vcMapping?.attributeName) {
        const attrName = fieldMeta.vcMapping.attributeName;
        if (attributes[attrName]) {
          newFormData[fieldKey] = attributes[attrName];
        }
      }
    });
    
    setFormData(newFormData);
    toast({
      title: "Credentials Verified",
      description: "Form fields have been auto-populated with verified data",
    });
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const getFieldValue = (fieldKey: string) => {
    return formData[fieldKey] || '';
  };

  const hasVerifiedFields = (config: any) => {
    const metadata = config?.metadata;
    const formSchema = config?.formSchema;
    
    return Object.values(metadata?.fields || {}).some((field: any) => field?.dataSource === 'verified') ||
           formSchema?.components?.some((c: any) => c.properties?.dataSource === 'verified');
  };

  const renderField = (component: any) => {
    const fieldKey = component.key;
    // Check if this field has a verified value from credential verification
    const hasVerifiedMapping = component.vcMapping?.attributeName && verifiedFields[component.vcMapping.attributeName];
    const isVerified = !!hasVerifiedMapping;
    const isReadOnly = isVerified;

    switch (component.type) {
      case 'textfield':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="text"
              value={getFieldValue(fieldKey)}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'email':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Input
              type="email"
              value={getFieldValue(fieldKey)}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Textarea
              value={getFieldValue(fieldKey)}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isReadOnly}
              className={isReadOnly ? "bg-green-50 border-green-200" : ""}
              rows={component.rows || 3}
            />
          </div>
        );

      case 'select':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
            <Select
              value={getFieldValue(fieldKey)}
              onValueChange={(value) => handleFieldChange(fieldKey, value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={isReadOnly ? "bg-green-50 border-green-200" : ""}>
                <SelectValue placeholder={component.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {component.data?.values?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={getFieldValue(fieldKey) || false}
                onCheckedChange={(checked) => handleFieldChange(fieldKey, checked)}
                disabled={isReadOnly}
              />
              <label className="text-sm font-medium text-gray-700">
                {component.label}
                {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isVerified && <VerifiedBadge />}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = formConfig as any;
    const submissionData = {
      formConfigId: parseInt(id!),
      data: formData,
      verifiedFields,
      metadata: config?.metadata
    };

    submitFormMutation.mutate(submissionData);
  };

  console.log('FillPage: isLoading:', isLoading, 'formConfig:', formConfig);
  
  if (isLoading) {
    console.log('FillPage: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!formConfig) {
    console.log('FillPage: No form config found, showing error');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">The requested form could not be found.</p>
        </div>
      </div>
    );
  }

  const config = formConfig as any;
  const formSchema = config?.formSchema;
  
  console.log('FillPage: Rendering form with config:', config, 'formSchema:', formSchema);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-medium text-gray-900">
              {config?.title || config?.name || "Form Submission"}
            </h1>
            {hasVerifiedFields(config) && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch('/api/proofs/init', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ formId: id })
                    })
                      .then(r => r.json())
                      .then(setVcModal)
                      .catch(console.error);
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

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {config?.title || "Form"}
                </h2>
                {config?.description && (
                  <p className="text-gray-600">{config.description}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formSchema?.components?.map((component: any) => renderField(component))}
                
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    disabled={submitFormMutation.isPending}
                    className="px-8"
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
                      fetch('/api/proofs/init', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ formId: id })
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