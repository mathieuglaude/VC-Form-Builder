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
  const [formioBuilder, setFormioBuilder] = useState<any>(null);

  // Initialize Form.io builder
  useEffect(() => {
    const loadFormioBuilder = async () => {
      try {
        // Import Form.io correctly
        const Formio = (await import('formiojs')).default;
        
        if (formBuilderRef.current && !formioBuilder) {
          formBuilderRef.current.innerHTML = '';
          
          const builderOptions = {
            builder: {
              basic: {
                title: 'Basic',
                default: true,
                weight: 0,
                components: {
                  textfield: true,
                  email: true,
                  textarea: true,
                  number: true,
                  checkbox: true,
                  selectboxes: true,
                  select: true,
                  radio: true,
                  datetime: true,
                  button: true
                }
              },
              advanced: false,
              data: false,
              layout: false
            }
          };

          // Create the builder instance using the correct API
          const builder = await Formio.builder(formBuilderRef.current, formSchema, builderOptions);

          // Listen for form changes
          builder.on('change', (schema: any) => {
            if (schema && schema.components) {
              setFormSchema(schema);
            }
          });

          setFormioBuilder(builder);
        }
      } catch (error) {
        console.error('Failed to load Form.io builder:', error);
        
        // Display a placeholder interface
        if (formBuilderRef.current) {
          formBuilderRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">📝</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Form Builder</h3>
                <p class="text-gray-500 mb-4">Professional drag-and-drop form creator</p>
                <p class="text-sm text-gray-400">Loading Form.io components...</p>
              </div>
            </div>
          `;
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadFormioBuilder, 100);

    return () => {
      clearTimeout(timer);
      if (formioBuilder && typeof formioBuilder.destroy === 'function') {
        formioBuilder.destroy();
      }
    };
  }, []);

  // Update builder when form schema changes externally
  useEffect(() => {
    if (formioBuilder && formSchema && typeof formioBuilder.setForm === 'function') {
      formioBuilder.setForm(formSchema);
    }
  }, [formioBuilder]);

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

      {/* Form.io Builder */}
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