import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import FieldConfigModal from "./FieldConfigModal";


import DeleteFormModal from "./DeleteFormModal";
import PublishFormDialog from "./PublishFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Share2, Copy } from "lucide-react";

interface FormBuilderProps {
  initialForm?: any;
  onSave: (formData: any) => void;
  onPreview: (formData: any) => void;
  onPublish?: () => void;
  onDelete?: () => void;
}

export default function FormBuilder({ initialForm, onSave, onPreview, onPublish, onDelete }: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialForm?.name || "");
  const [formDescription, setFormDescription] = useState(initialForm?.description || "");
  const [components, setComponents] = useState<any[]>(initialForm?.formSchema?.components || []);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [revocationPolicies, setRevocationPolicies] = useState<Record<string, boolean>>(initialForm?.revocationPolicies || {});
  const [isPublic, setIsPublic] = useState<boolean>(initialForm?.isPublic || false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete form mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initialForm?.id) throw new Error('No form ID');
      const response = await fetch(`/api/forms/${initialForm.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete form');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Form deleted",
        description: "Your form has been permanently deleted.",
      });
      if (onDelete) {
        onDelete();
      }
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the form. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Restore VC mapping data from metadata when loading existing form
  useEffect(() => {
    console.log('[hydrate] incoming initialForm', initialForm?.metadata?.fields);
    console.log('[hydrate] incoming components', initialForm?.formSchema?.components);
    
    if (initialForm?.metadata?.fields && initialForm?.formSchema?.components) {
      const restoredComponents = initialForm.formSchema.components.map((comp: any) => {
        const fieldMeta = initialForm.metadata.fields[comp.key];
        if (fieldMeta) {
          console.log(`[hydrate] restoring ${comp.key}:`, fieldMeta);
          return {
            ...comp,
            properties: {
              ...comp.properties,
              dataSource: fieldMeta.type,
              vcMapping: fieldMeta.vcMapping,
              credentialMode: fieldMeta.credentialMode,
              acceptRevoked: fieldMeta.acceptRevoked,
              options: fieldMeta.options
            }
          };
        }
        return comp;
      });
      console.log('[hydrate] components after merge', restoredComponents);
      setComponents(restoredComponents);
    }
  }, [initialForm]);

  // Fetch credential templates for wallet compatibility
  const { data: credentialTemplates = [] } = useQuery({
    queryKey: ['/api/cred-lib'],
    queryFn: async () => {
      const response = await fetch('/api/cred-lib');
      if (!response.ok) throw new Error('Failed to fetch credentials');
      return response.json();
    }
  });

  // Calculate credential requirements based on form components
  const credentialRequirements = components
    .filter(comp => comp.properties?.dataSource === 'verified')
    .map(comp => {
      const template = Array.isArray(credentialTemplates) ? 
        credentialTemplates.find((t: any) => 
          t.label === comp.properties?.vcMapping?.credentialType
        ) : null;
      return template ? {
        credentialType: template.label,
        compatibleWallets: template.compatibleWallets || [],
        walletRestricted: template.walletRestricted || false
      } : null;
    })
    .filter((req): req is NonNullable<typeof req> => req !== null);

  // Get unique credential types used in the form
  const credentialTypesSet = new Set<string>();
  components
    .filter(comp => comp.properties?.dataSource === 'verified' && comp.properties?.vcMapping?.credentialType)
    .forEach(comp => credentialTypesSet.add(comp.properties.vcMapping.credentialType));
  const usedCredentialTypes = Array.from(credentialTypesSet);

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
      description: `${componentLabels[type]} added to form`
    });
  }, [toast]);

  // Remove component function
  const removeComponent = useCallback((index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Component Removed",
      description: "Component removed from form"
    });
  }, [toast]);

  // Edit component function
  const editComponent = useCallback((component: any) => {
    setSelectedComponent(component);
    setIsConfigModalOpen(true);
  }, []);

  // Save component configuration
  const saveComponentConfig = useCallback((config: any) => {
    if (!selectedComponent) return;

    setComponents(prev => prev.map(comp => 
      comp.key === selectedComponent.key ? { ...comp, ...config } : comp
    ));

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
    const metadata: any = {
      fields: {}
    };
    components.forEach(comp => {
      if (comp.properties?.dataSource) {
        metadata.fields[comp.key] = {
          type: comp.properties.dataSource,
          ...(comp.properties.vcMapping && { vcMapping: comp.properties.vcMapping }),
          ...(comp.properties.options && { options: comp.properties.options }),
          ...(comp.properties.credentialMode && { credentialMode: comp.properties.credentialMode }),
          ...(comp.properties.acceptRevoked !== undefined && { acceptRevoked: comp.properties.acceptRevoked })
        };
      }
    });
    return metadata;
  };

  // Extract proof definition from VC components
  const extractProofDef = () => {
    const proofDef: Record<string, string[]> = {};
    
    components.forEach(component => {
      if (component.properties?.dataSource === 'verified' && 
          component.properties?.credential?.templateId && 
          component.properties?.credential?.attribute) {
        
        const templateId = component.properties.credential.templateId;
        const attribute = component.properties.credential.attribute;
        
        if (!proofDef[templateId]) {
          proofDef[templateId] = [];
        }
        
        if (!proofDef[templateId].includes(attribute)) {
          proofDef[templateId].push(attribute);
        }
      }
    });
    
    return Object.keys(proofDef).length > 0 ? proofDef : undefined;
  };

  // Handle save
  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      formSchema: { components },
      metadata: extractMetadata(),
      proofDef: extractProofDef(),
      revocationPolicies,
      isPublic,
      authorId: "demo",
      authorName: "Demo User"
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
            
            {/* Public URL Display */}
            {initialForm?.isPublished && initialForm?.publicSlug && (
              <div className="mt-4 flex items-center gap-2" hidden={!initialForm?.isPublished}>
                <span className="text-sm font-medium">Public URL:</span>
                <a 
                  href={`${window.location.origin}/f/${initialForm.publicSlug}`} 
                  target="_blank" 
                  rel="noopener"
                  className="text-blue-600 underline break-all"
                >
                  {`${window.location.origin}/f/${initialForm.publicSlug}`}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${initialForm.publicSlug}`)}
                  className="p-1 rounded hover:bg-slate-100"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4"/>
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <Switch
                id="publish-form"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="publish-form" className="text-sm text-gray-600">
                Publish to Community (makes form visible to all users)
              </Label>
            </div>
          </div>
          <div className="flex gap-3 ml-6">
            <Button variant="outline" onClick={handlePreview}>
              Preview
            </Button>
            <Button onClick={handleSave}>
              Save Form
            </Button>
            {initialForm?.id && (
              <Button 
                variant="default" 
                onClick={() => setIsPublishDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={initialForm?.isPublished}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {initialForm?.isPublished ? 'Published' : 'Publish'}
              </Button>
            )}
            {initialForm?.id && (
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex bg-gray-50">
        {/* Component Library */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Component Library</h3>
            <p className="text-sm text-gray-600 mb-6">Click to add components to your form</p>
            
            <div className="space-y-3">
              {[
                { type: 'textfield', label: 'Text Input', icon: '📝', description: 'Single line text field' },
                { type: 'email', label: 'Email', icon: '✉️', description: 'Email address input' },
                { type: 'textarea', label: 'Text Area', icon: '📄', description: 'Multi-line text input' },
                { type: 'number', label: 'Number', icon: '🔢', description: 'Numeric input field' },
                { type: 'select', label: 'Select List', icon: '📋', description: 'Dropdown selection' },
                { type: 'checkbox', label: 'Checkbox', icon: '☑️', description: 'Checkbox input' }
              ].map((component) => (
                <button
                  key={component.type}
                  onClick={() => addComponent(component.type)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{component.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{component.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">{component.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Preview */}
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Preview</h3>
            <p className="text-sm text-gray-600 mb-6">Your form components will appear here</p>
            
            {components.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No components added yet. Add components from the library on the left.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {components.map((component, index) => (
                  <div
                    key={component.key}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 cursor-move"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{component.label || 'Untitled Component'}</h4>
                        <p className="text-xs text-gray-500 mt-1">Type: {component.type}</p>
                        
                        {/* Show VC integration status */}
                        {component.properties?.dataSource === 'verified' && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🛡️ Verifiable Credential
                            </span>
                            {component.properties?.credentialMode === 'required' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ⚠️ Required
                              </span>
                            )}

                          </div>
                        )}
                        
                        {component.properties?.dataSource === 'picklist' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            📋 Pick List
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editComponent(component)}
                          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeComponent(index)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Component Preview */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {component.label}
                        {component.validate?.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {component.type === 'select' ? (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                          <option>Select an option...</option>
                          {component.properties?.options?.map((option: string, idx: number) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : component.type === 'textarea' ? (
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" 
                          rows={3}
                          placeholder={component.placeholder || `Enter ${component.label?.toLowerCase()}`}
                          disabled
                        />
                      ) : component.type === 'checkbox' ? (
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            disabled
                          />
                          <label className="ml-2 text-sm text-gray-900">
                            {component.description || component.label}
                          </label>
                        </div>
                      ) : (
                        <input
                          type={component.type === 'email' ? 'email' : component.type === 'number' ? 'number' : 'text'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          placeholder={component.placeholder || `Enter ${component.label?.toLowerCase()}`}
                          disabled
                        />
                      )}
                      
                      {component.description && (
                        <p className="text-xs text-gray-500 mt-1">{component.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Revocation Policies */}
      {usedCredentialTypes.length > 0 && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Revocation Policies</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure whether to accept revoked credentials for each credential type used in this form:
          </p>
          <div className="space-y-3">
            {usedCredentialTypes.map((credentialType) => (
              <div key={credentialType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{credentialType}</h4>
                  <p className="text-xs text-gray-500">
                    {revocationPolicies[credentialType] 
                      ? "Will accept credentials even if they have been revoked" 
                      : "Will reject any revoked credentials"
                    }
                  </p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={revocationPolicies[credentialType] || false}
                    onChange={(e) => setRevocationPolicies(prev => ({
                      ...prev,
                      [credentialType]: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Accept revoked</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Field Configuration Modal */}
      <FieldConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedComponent(null);
        }}
        onSave={saveComponentConfig}
        initialConfig={selectedComponent}
      />



      {/* Delete Form Modal */}
      <DeleteFormModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate();
          setIsDeleteModalOpen(false);
        }}
        formName={formTitle || 'Untitled Form'}
        isPublic={isPublic}
        isDeleting={deleteMutation.isPending}
      />

      {/* Publish Form Dialog */}
      <PublishFormDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        form={initialForm}
      />
    </div>
  );
}