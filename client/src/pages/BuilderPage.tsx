import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FormBuilder from "@/components/FormBuilder";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Eye, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BuilderPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Fetch existing form if editing
  const { data: formConfig, isLoading } = useQuery({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id
  });

  // Fetch all forms for listing
  const { data: forms } = useQuery({
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
        description: "Form created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      setLocation(`/builder/${data.id}`);
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
    // Generate slug from name if creating new form
    if (!id && formData.name) {
      formData.slug = generateSlug(formData.name);
    }
    
    // Ensure required fields are present
    const completeFormData = {
      name: formData.name || formData.title || 'Untitled Form',
      slug: formData.slug || generateSlug(formData.name || formData.title || 'untitled-form'),
      purpose: formData.purpose || formData.description || 'Form purpose not specified',
      logoUrl: formData.logoUrl || null,
      title: formData.title || formData.name || 'Untitled Form',
      description: formData.description || null,
      formSchema: formData.formSchema,
      metadata: formData.metadata,
      proofRequests: formData.proofRequests || []
    };

    if (id) {
      updateFormMutation.mutate(completeFormData);
    } else {
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
            {forms?.map((form: any) => (
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

  // Show preview mode
  if (isPreviewMode && previewData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-medium text-gray-900">Form Preview</h1>
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                Back to Builder
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">{previewData.title}</h2>
            {previewData.description && <p className="text-gray-600 mb-8">{previewData.description}</p>}
            <div className="space-y-6">
              {previewData.formSchema?.components?.map((component: any) => (
                <div key={component.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {component.label}
                    {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {component.type === 'select' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Select an option...</option>
                      {component.properties?.options?.map((option: string, idx: number) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : component.type === 'textarea' ? (
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      rows={3}
                      placeholder={`Enter ${component.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Enter ${component.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
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
        />
      </div>
    </div>
  );
}
