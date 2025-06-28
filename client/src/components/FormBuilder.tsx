import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormBuilderProps {
  initialForm?: any;
  onSave: (formData: any) => void;
  onPreview: (formData: any) => void;
}

export default function FormBuilder({ initialForm, onSave, onPreview }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialForm?.title || "");
  const [formDescription, setFormDescription] = useState(initialForm?.description || "");
  const [formSchema, setFormSchema] = useState(initialForm?.formSchema || { components: [] });
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isFormioLoaded, setIsFormioLoaded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Initialize Form.io builder
  useEffect(() => {
    let mounted = true;

    const loadFormioBuilder = async () => {
      try {
        // Load Form.io dynamically
        const formioModule = await import('formiojs');
        const Formio = formioModule.default || formioModule;

        if (!mounted || !formBuilderRef.current) return;

        // Clear any existing content
        formBuilderRef.current.innerHTML = '';

        // Create Form.io builder instance
        const builderOptions = {
          builder: {
            basic: true,
            advanced: false,
            data: false,
            layout: false,
            premium: false
          }
        };

        // Try to create the builder
        if (Formio && Formio.FormBuilder) {
          const builder = new Formio.FormBuilder(formBuilderRef.current, formSchema, builderOptions);
          
          // Listen for form changes
          builder.on('change', (updatedForm: any) => {
            if (mounted && updatedForm) {
              setFormSchema(updatedForm);
            }
          });

          if (mounted) {
            setIsFormioLoaded(true);
          }
        } else {
          throw new Error('FormBuilder not available');
        }

      } catch (error) {
        console.error('Form.io initialization failed:', error);
        
        if (!mounted || !formBuilderRef.current) return;

        // Create fallback simple builder
        setIsFormioLoaded(false);
        createFallbackBuilder();
      }
    };

    const createFallbackBuilder = () => {
      if (!formBuilderRef.current) return;
      
      formBuilderRef.current.innerHTML = `
        <div class="h-full bg-white border rounded-lg overflow-hidden">
          <div class="bg-gray-50 border-b p-4">
            <h3 class="font-medium text-gray-900">Form Components</h3>
            <p class="text-sm text-gray-500 mt-1">Click to add components to your form</p>
          </div>
          
          <div class="p-4 space-y-3">
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('textfield')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">📝</span>
                </div>
                <div>
                  <div class="font-medium">Text Input</div>
                  <div class="text-sm text-gray-500">Single line text field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('email')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">📧</span>
                </div>
                <div>
                  <div class="font-medium">Email</div>
                  <div class="text-sm text-gray-500">Email address field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('textarea')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">📄</span>
                </div>
                <div>
                  <div class="font-medium">Text Area</div>
                  <div class="text-sm text-gray-500">Multi-line text field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('number')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">🔢</span>
                </div>
                <div>
                  <div class="font-medium">Number</div>
                  <div class="text-sm text-gray-500">Numeric input field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('select')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">📋</span>
                </div>
                <div>
                  <div class="font-medium">Select List</div>
                  <div class="text-sm text-gray-500">Dropdown selection</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              class="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onclick="window.addFormComponent && window.addFormComponent('checkbox')"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                  <span class="text-sm">☑️</span>
                </div>
                <div>
                  <div class="font-medium">Checkbox</div>
                  <div class="text-sm text-gray-500">True/false option</div>
                </div>
              </div>
            </button>
          </div>
          
          <div class="border-t bg-gray-50 p-4">
            <h4 class="font-medium text-gray-900 mb-3">Form Preview</h4>
            <div id="form-preview" class="bg-white border rounded p-4 min-h-32">
              ${formSchema.components && formSchema.components.length > 0 
                ? formSchema.components.map((comp: any, index: number) => `
                  <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50 group hover:bg-gray-100 transition-colors">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">${comp.label}</label>
                        <div class="text-sm text-gray-500">${comp.type} component</div>
                        ${comp.required ? '<span class="text-xs text-red-500">* Required</span>' : ''}
                      </div>
                      <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onclick="window.editFormComponent && window.editFormComponent('${comp.key}')"
                          class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit component"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button 
                          type="button"
                          onclick="window.removeFormComponent && window.removeFormComponent('${comp.key}')"
                          class="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Remove component"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('') 
                : '<div class="text-gray-500 text-center py-8">Add components above to build your form</div>'
              }
            </div>
          </div>
        </div>
      `;

      // Add component addition functionality
      (window as any).addFormComponent = (type: string) => {
        const componentLabels: Record<string, string> = {
          textfield: 'Text Input',
          email: 'Email Address',
          textarea: 'Text Area',
          number: 'Number',
          select: 'Select List',
          checkbox: 'Checkbox'
        };

        const newComponent = {
          type,
          key: `${type}_${Date.now()}`,
          label: componentLabels[type] || `New ${type}`,
          input: true,
          tableView: true,
          properties: {
            dataSource: 'freetext'
          }
        };

        const updatedSchema = {
          ...formSchema,
          components: [...(formSchema.components || []), newComponent]
        };
        
        setFormSchema(updatedSchema);

        // Update preview with new component
        updateFormPreview();

        toast({
          title: "Component Added",
          description: `${componentLabels[type]} has been added to your form`
        });
      };

      // Edit component function
      (window as any).editFormComponent = (componentKey: string) => {
        const component = formSchema.components.find((comp: any) => comp.key === componentKey);
        if (component) {
          setSelectedComponent(component);
          setIsConfigModalOpen(true);
        }
      };

      // Remove component function
      (window as any).removeFormComponent = (componentKey: string) => {
        const updatedSchema = {
          ...formSchema,
          components: formSchema.components.filter((comp: any) => comp.key !== componentKey)
        };
        setFormSchema(updatedSchema);
        updateFormPreview();
        
        toast({
          title: "Component Removed",
          description: "Component has been removed from your form"
        });
      };

      // Function to update form preview
      const updateFormPreview = () => {
        const preview = document.getElementById('form-preview');
        if (preview) {
          if (formSchema.components && formSchema.components.length > 0) {
            preview.innerHTML = formSchema.components.map((comp: any) => `
              <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50 group hover:bg-gray-100 transition-colors">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">${comp.label}</label>
                    <div class="text-sm text-gray-500">${comp.type} component</div>
                    ${comp.required ? '<span class="text-xs text-red-500">* Required</span>' : ''}
                    ${comp.placeholder ? `<div class="text-xs text-gray-400">Placeholder: ${comp.placeholder}</div>` : ''}
                    ${comp.description ? `<div class="text-xs text-gray-400">Help: ${comp.description}</div>` : ''}
                    ${comp.properties?.dataSource === 'verified' ? '<span class="text-xs text-green-600 font-medium">🔒 Verified Data</span>' : ''}
                    ${comp.properties?.dataSource === 'picklist' ? '<span class="text-xs text-blue-600 font-medium">📋 Pick List</span>' : ''}
                  </div>
                  <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onclick="window.editFormComponent && window.editFormComponent('${comp.key}')"
                      class="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit component"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button 
                      type="button"
                      onclick="window.removeFormComponent && window.removeFormComponent('${comp.key}')"
                      class="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Remove component"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            `).join('');
          } else {
            preview.innerHTML = '<div class="text-gray-500 text-center py-8">Add components above to build your form</div>';
          }
        }
      };

      // Make updateFormPreview globally available
      (window as any).updateFormPreview = updateFormPreview;
    };

    loadFormioBuilder();

    return () => {
      mounted = false;
      // Clean up global function
      if ((window as any).addFormComponent) {
        delete (window as any).addFormComponent;
      }
    };
  }, []);

  const extractMetadata = () => {
    const metadata: any = {};
    
    formSchema.components?.forEach((component: any) => {
      if (component.properties?.dataSource === 'verified') {
        metadata[component.key] = {
          type: 'verified',
          vcMapping: component.properties.vcMapping
        };
      } else if (component.properties?.dataSource === 'picklist') {
        metadata[component.key] = {
          type: 'picklist',
          options: component.properties.options || []
        };
      } else {
        metadata[component.key] = {
          type: 'freetext'
        };
      }
    });

    return metadata;
  };

  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema,
      metadata: extractMetadata()
    };
    onSave(formData);
  };

  const handlePreview = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema,
      metadata: extractMetadata()
    };
    onPreview(formData);
  };

  const updateComponent = (updatedConfig: any) => {
    const updatedSchema = {
      ...formSchema,
      components: formSchema.components.map((comp: any) => 
        comp.key === selectedComponent.key 
          ? { ...comp, ...updatedConfig }
          : comp
      )
    };
    setFormSchema(updatedSchema);
    
    // Update the preview
    setTimeout(() => {
      const updateFormPreview = (window as any).updateFormPreview;
      if (updateFormPreview) {
        updateFormPreview();
      }
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-2xl">
            <Input
              placeholder="Form Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-lg font-medium mb-2"
            />
            <Textarea
              placeholder="Form Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>
          <div className="flex space-x-3 ml-6">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={formBuilderRef} 
          className="h-full w-full"
          style={{ minHeight: '600px' }}
        />
      </div>

      {/* Component Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configure Component</DialogTitle>
          </DialogHeader>
          
          {selectedComponent && (
            <ComponentConfigForm 
              component={selectedComponent}
              onSave={updateComponent}
              onClose={() => setIsConfigModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ComponentConfigFormProps {
  component: any;
  onSave: (config: any) => void;
  onClose: () => void;
}

function ComponentConfigForm({ component, onSave, onClose }: ComponentConfigFormProps) {
  const [config, setConfig] = useState({
    label: component.label || '',
    placeholder: component.placeholder || '',
    description: component.description || '',
    required: component.required || false,
    dataSource: component.properties?.dataSource || 'freetext'
  });

  const handleSave = () => {
    onSave({
      ...config,
      properties: {
        ...component.properties,
        dataSource: config.dataSource
      }
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Field Label</Label>
          <Input
            id="label"
            value={config.label}
            onChange={(e) => setConfig({ ...config, label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div>
          <Label htmlFor="placeholder">Placeholder Text</Label>
          <Input
            id="placeholder"
            value={config.placeholder}
            onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div>
          <Label htmlFor="description">Help Text</Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            placeholder="Enter help text for this field"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={config.required}
            onCheckedChange={(checked) => setConfig({ ...config, required: !!checked })}
          />
          <Label htmlFor="required">Required field</Label>
        </div>

        <div>
          <Label htmlFor="dataSource">Data Source</Label>
          <Select value={config.dataSource} onValueChange={(value) => setConfig({ ...config, dataSource: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freetext">Free Text Entry</SelectItem>
              <SelectItem value="picklist">Pick List (Predefined Options)</SelectItem>
              <SelectItem value="verified">Verified Credential Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.dataSource === 'verified' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Verifiable Credential Configuration</h4>
            <p className="text-sm text-green-700">
              This field will be auto-populated with verified data from digital credentials.
              Configure the credential mapping in the VC Configuration section.
            </p>
          </div>
        )}

        {config.dataSource === 'picklist' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Pick List Configuration</h4>
            <p className="text-sm text-blue-700">
              Define predefined options that users can select from.
              Configure options in the advanced settings.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}