import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, Eye, Plus, Settings, Shield, ChevronDown, ChevronRight, GripVertical, Edit2, Trash2 } from "lucide-react";
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
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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

    setFormSchema((prev: any) => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    // Expand the newly added field
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      newSet.add(newComponent.key);
      return newSet;
    });
  };

  const editComponent = (component: any) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  };

  const updateComponent = (updatedConfig: any) => {
    setFormSchema((prev: any) => ({
      ...prev,
      components: prev.components.map((comp: any) => 
        comp.key === selectedComponent.key 
          ? { ...comp, ...updatedConfig }
          : comp
      )
    }));
  };

  const removeComponent = (componentKey: string) => {
    setFormSchema((prev: any) => ({
      ...prev,
      components: prev.components.filter((comp: any) => comp.key !== componentKey)
    }));
    
    // Remove from expanded fields
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentKey);
      return newSet;
    });
  };

  const toggleFieldExpansion = (componentKey: string) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentKey)) {
        newSet.delete(componentKey);
      } else {
        newSet.add(componentKey);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, component: any, index: number) => {
    setDraggedItem({ component, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem) return;
    
    const { index: dragIndex } = draggedItem;
    if (dragIndex === dropIndex) return;

    setFormSchema((prev: any) => {
      const newComponents = [...prev.components];
      const [draggedComponent] = newComponents.splice(dragIndex, 1);
      newComponents.splice(dropIndex, 0, draggedComponent);
      
      return {
        ...prev,
        components: newComponents
      };
    });

    setDraggedItem(null);
  };

  const handleComponentDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      addComponent(componentType);
    }
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
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
                draggable
                className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-300 cursor-grab active:cursor-grabbing transition-colors"
                onClick={() => addComponent(component.type)}
                onDragStart={(e) => handleComponentDragStart(e, component.type)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">{component.icon}</span>
                  <span className="text-sm font-medium">{component.label}</span>
                </div>
              </div>
            ))}
            
            {/* Special Verified Field Component */}
            <div
              draggable
              className="p-3 bg-green-50 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 cursor-grab active:cursor-grabbing transition-colors"
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
                setFormSchema((prev: any) => ({
                  ...prev,
                  components: [...prev.components, verifiedComponent]
                }));
                setExpandedFields(prev => {
                  const newSet = new Set(prev);
                  newSet.add(verifiedComponent.key);
                  return newSet;
                });
              }}
              onDragStart={(e) => handleComponentDragStart(e, 'verified')}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Verified Field</span>
              </div>
              <span className="text-xs text-green-600">VC Integration</span>
            </div>
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
              <div className="space-y-4" ref={formBuilderRef}>
                {formSchema.components.map((component: any, index: number) => {
                  const isExpanded = expandedFields.has(component.key);
                  const isDragOver = dragOverIndex === index;
                  
                  return (
                    <div
                      key={component.key}
                      draggable
                      className={`border-2 rounded-lg transition-all duration-200 ${getComponentBorderClass(component)} ${
                        isDragOver ? 'border-blue-400 bg-blue-50' : ''
                      } ${draggedItem?.component.key === component.key ? 'opacity-50' : ''}`}
                      onDragStart={(e) => handleDragStart(e, component, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <Collapsible open={isExpanded} onOpenChange={() => toggleFieldExpansion(component.key)}>
                        {/* Field Header */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <CollapsibleTrigger className="flex items-center space-x-2 flex-1 text-left hover:bg-gray-50 p-2 rounded transition-colors">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                              <div className="flex items-center space-x-2 flex-1">
                                {getComponentIcon(component)}
                                <span className="text-sm font-medium text-gray-700">
                                  {component.label}
                                  {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
                                </span>
                                {component.properties?.dataSource === 'verified' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </CollapsibleTrigger>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editComponent(component);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeComponent(component.key);
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Collapsed preview */}
                          {!isExpanded && (
                            <div className="mt-2 pl-10">
                              <span className="text-xs text-gray-500">
                                {component.type} • {component.properties?.dataSource === 'verified' ? 'Verified Attribute' : 
                                                  component.properties?.dataSource === 'picklist' ? 'Pick List' : 'Free Text'}
                                {component.properties?.dataSource === 'verified' && component.properties?.vcMapping?.credentialType && 
                                  ` • ${component.properties.vcMapping.credentialType}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expanded Content */}
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="pl-10 space-y-3">
                            {/* Mock field display */}
                            {component.type === 'select' ? (
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                                <option>Select...</option>
                                {component.properties?.options?.map((option: string, idx: number) => (
                                  <option key={idx} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : component.type === 'textarea' ? (
                              <textarea 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                rows={3} 
                                disabled 
                                placeholder={`Enter ${component.label.toLowerCase()}`}
                              />
                            ) : component.type === 'checkbox' ? (
                              <div className="flex items-center">
                                <input type="checkbox" className="mr-2" disabled />
                                <span className="text-sm">{component.label}</span>
                              </div>
                            ) : (
                              <input
                                type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder={`Enter ${component.label.toLowerCase()}`}
                                disabled
                              />
                            )}

                            {/* Field metadata */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div>
                                <span className="font-medium">Type:</span> {component.type} •{' '}
                                <span className="font-medium">Source:</span>{' '}
                                {component.properties?.dataSource === 'verified' ? 'Verified Attribute' : 
                                 component.properties?.dataSource === 'picklist' ? 'Pick List' : 'Free Text'}
                                {component.properties?.dataSource === 'verified' && component.properties?.vcMapping?.credentialType && 
                                  ` (${component.properties.vcMapping.credentialType})`}
                              </div>
                              <span className="font-medium">Key:</span> {component.key}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}

                {/* Drop Zone */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  onDrop={handleDropZoneDrop}
                  onDragOver={handleDropZoneDragOver}
                >
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Drop components here or click sidebar items to add</p>
                  <p className="text-xs text-gray-400 mt-1">Drag components from the sidebar or drag existing fields to reorder</p>
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
