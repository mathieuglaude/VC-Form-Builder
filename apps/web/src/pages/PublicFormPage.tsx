import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Fetch public form by slug
  const { data: form, isLoading } = useQuery({
    queryKey: ['/api/public', slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Form not found');
        }
        throw new Error('Failed to load form');
      }
      return response.json();
    },
    enabled: !!slug
  });

  const handleInputChange = (componentKey: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [componentKey]: value
    }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    try {
      const response = await fetch(`/api/forms/${form.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: responses,
          metadata: {
            submittedAt: new Date(),
            userAgent: navigator.userAgent
          }
        })
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        setResponses({});
      } else {
        alert('Failed to submit form');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600">The form you're looking for doesn't exist or has been unpublished.</p>
        </div>
      </div>
    );
  }

  const components = form.formSchema?.components || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{form.name}</CardTitle>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {components.map((component: any, index: number) => (
              <div key={`component-${index}`} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {component.label}
                  {component.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {component.type === 'select' ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={responses[component.key] || ''}
                    onChange={(e) => handleInputChange(component.key, e.target.value)}
                    required={component.required}
                  >
                    <option value="">Choose an option</option>
                    {component.options?.map((option: any, optIndex: number) => (
                      <option key={optIndex} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : component.type === 'textarea' ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={component.placeholder || `Enter ${component.label?.toLowerCase()}`}
                    value={responses[component.key] || ''}
                    onChange={(e) => handleInputChange(component.key, e.target.value)}
                    required={component.required}
                  />
                ) : component.type === 'checkbox' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={responses[component.key] || false}
                      onChange={(e) => handleInputChange(component.key, e.target.checked)}
                      required={component.required}
                    />
                    <label className="ml-2 text-sm text-gray-900">
                      {component.description || component.label}
                    </label>
                  </div>
                ) : (
                  <input
                    type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={component.placeholder || `Enter ${component.label?.toLowerCase()}`}
                    value={responses[component.key] || ''}
                    onChange={(e) => handleInputChange(component.key, e.target.value)}
                    required={component.required}
                  />
                )}
                
                {component.description && component.type !== 'checkbox' && (
                  <p className="text-xs text-gray-500">{component.description}</p>
                )}

                {/* Show credential verification info if applicable */}
                {component.credentialMapping && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      🔒 This field can be auto-filled with verified credential data
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6">
              <Button 
                onClick={handleSubmit}
                className="w-full"
                size="lg"
              >
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}