import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FieldConfigModal from "./FieldConfigModal";

interface FormBuilderProps {
  initialForm?: any;
  onSave: (formData: any) => void;
  onPreview: (formData: any) => void;
}

export default function FormBuilder({ initialForm, onSave, onPreview }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialForm?.name || "");
  const [formDescription, setFormDescription] = useState(initialForm?.description || "");
  const [components, setComponents] = useState<any[]>(initialForm?.formSchema?.components || []);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { toast } = useToast();

  // Add component function
  const addComponent = useCallback((type: string) => {
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
      label: componentLabels[type] || 'Component',
      input: true,
      tableView: true,
      properties: {
        dataSource: 'freetext'
      }
    };

    setComponents(prev => {
      const newComponents = [...prev, newComponent];
      console.log('Adding component. Current components:', prev.length, 'New total:', newComponents.length);
      console.log('Updated schema components:', newComponents);
      return newComponents;
    });

    toast({
      title: "Component Added",
      description: `${componentLabels[type]} has been added to your form`
    });
  }, [toast]);

  // Remove component function
  const removeComponent = useCallback((key: string) => {
    setComponents(prev => prev.filter(comp => comp.key !== key));
    toast({
      title: "Component Removed",
      description: "Component has been removed from your form"
    });
  }, [toast]);

  // Edit component function
  const editComponent = useCallback((key: string) => {
    const component = components.find(comp => comp.key === key);
    if (component) {
      setSelectedComponent(component);
      setIsConfigModalOpen(true);
    }
  }, [components]);

  // Update component function
  const updateComponent = useCallback((updatedConfig: any) => {
    if (!selectedComponent) return;
    
    setComponents(prev => 
      prev.map(comp => 
        comp.key === selectedComponent.key 
          ? { ...comp, ...updatedConfig }
          : comp
      )
    );
    
    setIsConfigModalOpen(false);
    setSelectedComponent(null);
    
    toast({
      title: "Component Updated",
      description: "Component configuration has been saved"
    });
  }, [selectedComponent, toast]);

  // Drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState<number>(-1);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
      setComponents(prev => {
        const newComponents = [...prev];
        const draggedComponent = newComponents[draggedIndex];
        
        if (draggedComponent) {
          // Remove the dragged component
          newComponents.splice(draggedIndex, 1);
          
          // Insert at new position
          const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
          newComponents.splice(adjustedDropIndex, 0, draggedComponent);
        }
        
        return newComponents;
      });
    }
    
    setDraggedIndex(-1);
  }, [draggedIndex]);

  // Extract metadata for VC integration
  const extractMetadata = () => {
    const metadata: any = {};
    components.forEach(comp => {
      if (comp.properties?.dataSource) {
        metadata[comp.key] = {
          type: comp.properties.dataSource,
          ...(comp.properties.vcMapping && { vcMapping: comp.properties.vcMapping }),
          ...(comp.properties.options && { options: comp.properties.options })
        };
      }
    });
    return metadata;
  };

  // Handle save
  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema: { components },
      metadata: extractMetadata()
    };
    onSave(formData);
  };

  // Handle preview
  const handlePreview = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema: { components },
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
              placeholder="Form Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-3 ml-6">
            <Button variant="outline" onClick={handlePreview}>
              Preview
            </Button>
            <Button onClick={handleSave}>
              Save Form
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50">
        {/* Component Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50 border-b p-4">
            <h4 className="font-medium text-gray-900">Component Library</h4>
            <p className="text-sm text-gray-500 mt-1">Click to add components to your form</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('textfield')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">📝</span>
                </div>
                <div>
                  <div className="font-medium">Text Input</div>
                  <div className="text-sm text-gray-500">Single line text field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('email')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">📧</span>
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Email address input</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('textarea')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">📄</span>
                </div>
                <div>
                  <div className="font-medium">Text Area</div>
                  <div className="text-sm text-gray-500">Multi-line text input</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('number')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">🔢</span>
                </div>
                <div>
                  <div className="font-medium">Number</div>
                  <div className="text-sm text-gray-500">Numeric input field</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('select')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">📋</span>
                </div>
                <div>
                  <div className="font-medium">Select List</div>
                  <div className="text-sm text-gray-500">Dropdown selection</div>
                </div>
              </div>
            </button>
            
            <button 
              type="button"
              className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              onClick={() => addComponent('checkbox')}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                  <span className="text-sm">☑️</span>
                </div>
                <div>
                  <div className="font-medium">Checkbox</div>
                  <div className="text-sm text-gray-500">True/false option</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Form Preview */}
        <div className="flex-1 bg-white">
          <div className="bg-gray-50 border-b p-4">
            <h4 className="font-medium text-gray-900">Form Preview</h4>
            <p className="text-sm text-gray-500 mt-1">Your form components will appear here</p>
          </div>
          <div className="p-6 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
            {components.length === 0 ? (
              <div className="text-gray-500 text-center py-12">
                Add components from the left to build your form
              </div>
            ) : (
              <div className="space-y-4">
                {components.map((comp, index) => (
                  <div 
                    key={comp.key}
                    className="p-4 border border-gray-200 rounded-lg bg-white group hover:bg-gray-50 transition-colors shadow-sm" 
                    draggable={true}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center flex-1">
                        <div className="cursor-move mr-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">{comp.label}</label>
                          <div className="text-sm text-gray-500 mb-2">{comp.type} component</div>
                          {comp.required && (
                            <span className="inline-block text-xs text-red-500 bg-red-50 px-2 py-1 rounded mb-2">* Required</span>
                          )}
                          {comp.placeholder && (
                            <div className="text-xs text-gray-400 mb-1">Placeholder: {comp.placeholder}</div>
                          )}
                          {comp.description && (
                            <div className="text-xs text-gray-400 mb-1">Help: {comp.description}</div>
                          )}
                          {comp.properties?.dataSource === 'verified' && (
                            <div className="space-y-1">
                              <span className="inline-block text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                🔒 Verifiable Credential
                              </span>
                              {comp.properties?.credentialMode === 'required' && (
                                <span className="inline-block text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded ml-1">
                                  ⚠️ Required
                                </span>
                              )}
                              {comp.properties?.credentialMode === 'optional' && (
                                <span className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded ml-1">
                                  ℹ️ Optional
                                </span>
                              )}
                            </div>
                          )}
                          {comp.properties?.dataSource === 'picklist' && (
                            <span className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">📋 Pick List</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => editComponent(comp.key)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit component"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeComponent(comp.key)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Remove component"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Configuration Modal */}
      <FieldConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedComponent(null);
        }}
        onSave={updateComponent}
        initialConfig={selectedComponent}
      />
    </div>
  );
}