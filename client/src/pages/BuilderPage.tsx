import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FormBuilder from "@/components/FormBuilder";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Eye, Settings, Shield, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import VerifiedBadge from "@/components/VerifiedBadge";

// FormPreviewMode component that mimics FillPage layout exactly
function FormPreviewMode({ formData, onBack }: { formData: any; onBack: () => void }) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [verifiedFields, setVerifiedFields] = useState<Record<string, any>>({});
  const [vcModal, setVcModal] = useState<{ reqId: string; qr: string } | null>(null);

  const hasVerifiedFields = () => {
    const metadata = formData?.metadata;
    return Object.values(metadata?.fields || {}).some((field: any) => field?.type === 'verified');
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const getFieldValue = (fieldKey: string) => {
    return formValues[fieldKey] || '';
  };

  const renderField = (component: any) => {
    const fieldKey = component.key;
    const isVerified = verifiedFields[fieldKey];
    const fieldValue = getFieldValue(fieldKey);

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
              value={fieldValue}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
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
              value={fieldValue}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
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
              value={fieldValue}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
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
              value={fieldValue} 
              onValueChange={(value) => handleFieldChange(fieldKey, value)}
              disabled={isVerified}
            >
              <SelectTrigger className={isVerified ? "bg-green-50 border-green-200" : ""}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {(component.properties?.options || ['Option 1', 'Option 2', 'Option 3']).map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
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
              value={fieldValue}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              placeholder={component.placeholder}
              required={component.validate?.required}
              readOnly={isVerified}
              className={isVerified ? "bg-green-50 border-green-200" : ""}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-medium text-gray-900">
              {formData?.title || "Form Preview"}
            </h1>
            <Button variant="outline" onClick={onBack}>
              Back to Builder
            </Button>
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
                  {formData?.title || "Form"}
                </h2>
                {formData?.description && (
                  <p className="text-gray-600">{formData.description}</p>
                )}
              </div>

              <form className="space-y-6">
                {formData?.formSchema?.components?.map((component: any) => renderField(component))}
                
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    className="px-8"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Form (Preview)
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
                      // Mock QR for preview mode
                      setVcModal({
                        reqId: 'preview-mode',
                        qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+CiAgICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogICAgICA8cmVjdCB4PSI1MCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICAgICAgPHJlY3QgeD0iOTAiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDxyZWN0IHg9IjEzMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICAgICAgPHJlY3QgeD0iMTcwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogICAgICA8cmVjdCB4PSIxMCIgeT0iNTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICAgICAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDxyZWN0IHg9IjkwIiB5PSI1MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogICAgICA8cmVjdCB4PSIxMzAiIHk9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDxyZWN0IHg9IjE3MCIgeT0iNTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICAgICAgPHJlY3QgeD0iMTAiIHk9IjkwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDxyZWN0IHg9IjUwIiB5PSI5MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogICAgICA8cmVjdCB4PSI5MCIgeT0iOTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KICAgICAgPHJlY3QgeD0iMTMwIiB5PSI5MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgogICAgICA8cmVjdCB4PSIxNzAiIHk9IjkwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiPlBSRVZJRVc8L3RleHQ+CiAgICA8L3N2Zz4='
                      });
                    }}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Start Verification (Preview)
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

export default function BuilderPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Determine if we're editing an existing form or creating new
  const isEditing = id && id !== 'new';

  // Fetch existing form if editing
  const { data: formConfig, isLoading } = useQuery({
    queryKey: [`/api/forms/${id}`],
    enabled: Boolean(isEditing)
  });

  // Fetch all forms for listing
  const { data: forms = [] } = useQuery({
    queryKey: ['/api/forms'],
    enabled: !id
  });

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('POST', '/api/forms', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Form "${data.name}" created successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      // Redirect to home page to show the new form
      setLocation('/');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive"
      });
    }
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await apiRequest('PUT', `/api/forms/${id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form saved successfully!"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${id}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    }
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = (formData: any) => {
    console.log('Form save triggered:', { id, isEditing, formData });
    
    // Ensure required fields are present
    const completeFormData = {
      name: formData.title || 'Untitled Form',
      slug: generateSlug(formData.title || 'untitled-form'),
      purpose: formData.description || 'Form purpose not specified',
      logoUrl: null,
      title: formData.title || 'Untitled Form',
      description: formData.description || null,
      formSchema: formData.formSchema,
      metadata: formData.metadata || {},
      proofRequests: [],
      revocationPolicies: formData.revocationPolicies || {}
    };

    console.log('Complete form data:', completeFormData);

    if (isEditing) {
      console.log('Updating existing form');
      updateFormMutation.mutate(completeFormData);
    } else {
      console.log('Creating new form');
      createFormMutation.mutate(completeFormData);
    }
  };

  const handlePreview = (formData: any) => {
    setPreviewData(formData);
    setIsPreviewMode(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Show form list if no specific form ID
  if (!id && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Forms</h2>
            <p className="text-gray-600">Create and manage forms with verifiable credential integration</p>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Form Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 cursor-pointer transition-colors" onClick={() => setLocation('/builder/new')}>
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Form</h3>
                <p className="text-sm text-gray-500">Start building a new form with VC integration</p>
              </CardContent>
            </Card>

            {/* Existing Forms */}
            {(forms as any[])?.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/builder/${form.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setLocation(`/form/${form.id}`); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setLocation(`/builder/${form.id}`); }}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{form.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{form.description || "No description"}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    <span>{form.formSchema?.components?.length || 0} fields</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show preview mode with consistent layout
  if (isPreviewMode && previewData) {
    return <FormPreviewMode formData={previewData} onBack={() => setIsPreviewMode(false)} />;
  }

  // Show form builder
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation('/')}>
                ← Back
              </Button>
              <h1 className="text-xl font-medium text-gray-900">Form Builder Pro</h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1">
        <FormBuilder
          initialForm={formConfig}
          onSave={handleSave}
          onPreview={handlePreview}
          onDelete={() => setLocation('/builder')}
        />
      </div>
    </div>
  );
}
