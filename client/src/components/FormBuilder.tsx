import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import FieldConfigModal from "./FieldConfigModal";
import WalletSelector from "./WalletSelector";
import IssuanceActionModal from "./IssuanceActionModal";
import { useQuery } from "@tanstack/react-query";

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
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [revocationPolicies, setRevocationPolicies] = useState<Record<string, boolean>>(initialForm?.revocationPolicies || {});
  const [isPublic, setIsPublic] = useState<boolean>(initialForm?.isPublic || false);
  const [issuanceActions, setIssuanceActions] = useState<any[]>(initialForm?.metadata?.issuanceActions || []);
  const [isIssuanceModalOpen, setIsIssuanceModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch credential templates for wallet compatibility
  const { data: credentialTemplates = [] } = useQuery({
    queryKey: ['/api/cred-lib'],
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
      fields: {},
      issuanceActions
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

      {/* Wallet Selector */}
      {credentialRequirements.length > 0 && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Wallet Selection</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select which wallets to recommend to users filling out this form:
          </p>
          <WalletSelector
            credentialRequirements={credentialRequirements as any}
            selectedWallets={selectedWallets}
            onWalletChange={setSelectedWallets}
          />
        </div>
      )}

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

      {/* Credential Issuance Actions */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Credential Issuance Actions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIssuanceModalOpen(true)}
            className="flex items-center gap-2"
          >
            <span>⚡</span>
            Configure Issuance
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Automatically issue credentials when forms are submitted. Configure which credentials to issue and how form data maps to credential attributes.
        </p>
        
        {issuanceActions.length > 0 ? (
          <div className="space-y-2">
            {issuanceActions.map((action: any, index: number) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
                  <p className="text-xs text-gray-500">
                    Will issue credential on form submission
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ⚡ Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">No issuance actions configured</p>
            <p className="text-xs text-gray-400 mt-1">Click "Configure Issuance" to set up automatic credential issuance</p>
          </div>
        )}
      </div>

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

      {/* Issuance Action Modal */}
      <IssuanceActionModal
        isOpen={isIssuanceModalOpen}
        onClose={() => setIsIssuanceModalOpen(false)}
        onSave={setIssuanceActions}
        initialActions={issuanceActions}
        formFields={components.map(comp => ({
          key: comp.key,
          label: comp.label || comp.key,
          type: comp.type
        }))}
      />
    </div>
  );
}