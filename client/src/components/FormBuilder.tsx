import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
                ? formSchema.components.map((comp: any) => `
                  <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
                    <label class="block text-sm font-medium text-gray-700 mb-1">${comp.label}</label>
                    <div class="text-sm text-gray-500">${comp.type} component</div>
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

        // Update preview immediately
        const preview = document.getElementById('form-preview');
        if (preview) {
          const componentHtml = `
            <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
              <label class="block text-sm font-medium text-gray-700 mb-1">${newComponent.label}</label>
              <div class="text-sm text-gray-500">${type} component</div>
            </div>
          `;
          
          if (preview.innerHTML.includes('Add components above')) {
            preview.innerHTML = componentHtml;
          } else {
            preview.innerHTML += componentHtml;
          }
        }

        toast({
          title: "Component Added",
          description: `${componentLabels[type]} has been added to your form`
        });
      };
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
    </div>
  );
}