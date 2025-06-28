import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, Plus, Settings, Shield } from "lucide-react";
import FieldConfigModal from "./FieldConfigModal";
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
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock Form.io builder components
  const componentLibrary = [
    { type: 'textfield', label: 'Text Input', icon: '📝' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'select', label: 'Select List', icon: '📋' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'datetime', label: 'Date/Time', icon: '📅' }
  ];

  const addComponent = (componentType: string) => {
    const newComponent = {
      type: componentType,
      key: `${componentType}_${Date.now()}`,
      label: `New ${componentType}`,
      input: true,
      tableView: true,
      properties: {
        dataSource: 'freetext'
      }
    };

    setFormSchema(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const editComponent = (component: any) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  };

  const updateComponent = (updatedConfig: any) => {
    setFormSchema(prev => ({
      ...prev,
      components: prev.components.map((comp: any) => 
        comp.key === selectedComponent.key 
          ? { ...comp, ...updatedConfig }
          : comp
      )
    }));
  };

  const removeComponent = (componentKey: string) => {
    setFormSchema(prev => ({
      ...prev,
      components: prev.components.filter((comp: any) => comp.key !== componentKey)
    }));
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a form title",
        variant: "destructive"
      });
      return;
    }

    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema,
      metadata: extractMetadata()
    };

    onSave(formData);
  };

  const extractMetadata = () => {
    const metadata: any = { fields: {} };
    
    formSchema.components.forEach((component: any) => {
      if (component.properties) {
        metadata.fields[component.key] = {
          type: component.properties.dataSource,
          options: component.properties.options,
          vcMapping: component.properties.vcMapping
        };
      }
    });

    return metadata;
  };

  const getComponentIcon = (component: any) => {
    if (component.properties?.dataSource === 'verified') {
      return <Shield className="w-4 h-4 text-green-600" />;
    }
    return componentLibrary.find(c => c.type === component.type)?.icon || '📝';
  };

  const getComponentBorderClass = (component: any) => {
    if (component.properties?.dataSource === 'verified') {
      return 'border-green-200 bg-green-50';
    }
    return 'border-gray-200';
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Form Components</h2>
          <div className="space-y-2">
            {componentLibrary.map((component) => (
              <div
                key={component.type}
                className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => addComponent(component.type)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">{component.icon}</span>
                  <span className="text-sm font-medium">{component.label}</span>
                </div>
              </div>
            ))}
            
            {/* Special Verified Field Component */}
            <div
              className="p-3 bg-green-50 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 cursor-pointer transition-colors"
              onClick={() => {
                const verifiedComponent = {
                  type: 'textfield',
                  key: `verified_${Date.now()}`,
                  label: 'Verified Field',
                  input: true,
                  tableView: true,
                  properties: {
                    dataSource: 'verified',
                    vcMapping: {
                      credentialType: '',
                      attributeName: '',
                      issuerDid: ''
                    }
                  }
                };
                setFormSchema(prev => ({
                  ...prev,
                  components: [...prev.components, verifiedComponent]
                }));
              }}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Verified Field</span>
              </div>
              <span className="text-xs text-green-600">VC Integration</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Form Settings</h3>
          <div className="space-y-3">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Form Properties
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              VC Configuration
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onPreview({ title: formTitle, description: formDescription, formSchema, metadata: extractMetadata() })}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Form
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{formTitle || "New Form"}</h2>
              <p className="text-sm text-gray-500">Form Builder</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => onPreview({ title: formTitle, description: formDescription, formSchema, metadata: extractMetadata() })}>
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

        {/* Form Builder Canvas */}
        <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 min-h-96">
              {/* Form Header */}
              <div className="mb-8">
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Form Title"
                  className="text-2xl font-medium border-none p-0 mb-2 focus-visible:ring-0"
                />
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Form description..."
                  className="border-none p-0 resize-none focus-visible:ring-0"
                  rows={2}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6" ref={formBuilderRef}>
                {formSchema.components.map((component: any) => (
                  <div
                    key={component.key}
                    className={`border-2 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer ${getComponentBorderClass(component)}`}
                    onClick={() => editComponent(component)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {component.label}
                        {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
                        {component.properties?.dataSource === 'verified' && (
                          <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </label>
                      <div className="flex items-center space-x-2">
                        {getComponentIcon(component)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(component.key);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mock field display */}
                    {component.type === 'select' ? (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                        <option>Select...</option>
                      </select>
                    ) : component.type === 'textarea' ? (
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} disabled />
                    ) : component.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" disabled />
                        <span className="text-sm">Checkbox option</span>
                      </div>
                    ) : (
                      <input
                        type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={`Enter ${component.label.toLowerCase()}`}
                        disabled
                      />
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Data Source: {component.properties?.dataSource === 'verified' ? 'Verified Attribute' : 
                                     component.properties?.dataSource === 'picklist' ? 'Pick List' : 'Free Text'}
                        {component.properties?.dataSource === 'verified' && component.properties?.vcMapping?.credentialType && 
                          ` (${component.properties.vcMapping.credentialType})`}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 p-0">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Drop Zone */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Drop components here or click to add</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Field Configuration Modal */}
      <FieldConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={updateComponent}
        initialConfig={selectedComponent}
      />
    </div>
  );
}
