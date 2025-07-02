import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataSource } from "@shared/schema";

interface VCMapping {
  credentialType: string;
  attributeName: string;
}

interface FieldConfig {
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  dataSource: DataSource | 'freetext' | 'picklist'; // Legacy support
  credentialMode: 'optional' | 'required';
  options: string;
  vcMapping: VCMapping;
}

interface FieldConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: FieldConfig) => void;
  initialConfig?: Partial<FieldConfig> & { properties?: Record<string, unknown> };
}

export default function FieldConfigModal({ isOpen, onClose, onSave, initialConfig }: FieldConfigModalProps) {
  console.log('[config-modal] props.field', initialConfig);
  console.log('[config-modal] vcMapping', initialConfig?.properties?.vcMapping);
  console.log('[config-modal] dataSource', initialConfig?.properties?.dataSource);
  console.log('[config-modal] credentialMode', initialConfig?.properties?.credentialMode);
  
  const { control, reset, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      label: '',
      placeholder: '',
      description: '',
      required: false,
      dataSource: 'freetext',
      credentialMode: 'optional',
      options: '',
      vcMapping: {
        credentialType: '',
        attributeName: ''
      }
    }
  });

  const watchedDataSource = watch('dataSource');
  const watchedCredentialType = watch('vcMapping.credentialType');
  
  // Debug current form values
  const currentValues = getValues();
  console.log('[config-modal render] current form values:', currentValues);

  // Populate form with existing field data
  useEffect(() => {
    if (!initialConfig || !isOpen) return;

    console.log('[config-modal] resetting form with:', {
      label: initialConfig.label ?? '',
      placeholder: initialConfig.placeholder ?? '',
      description: initialConfig.description ?? '',
      required: initialConfig.validate?.required ?? false,
      dataSource: initialConfig.properties?.dataSource ?? 'freetext',
      credentialMode: initialConfig.properties?.credentialMode ?? 'optional',
      options: initialConfig.properties?.options?.join('\n') ?? '',
      vcMapping: {
        credentialType: initialConfig.properties?.vcMapping?.credentialType ?? '',
        attributeName: initialConfig.properties?.vcMapping?.attributeName ?? ''
      }
    });

    reset({
      label: initialConfig.label ?? '',
      placeholder: initialConfig.placeholder ?? '',
      description: initialConfig.description ?? '',
      required: initialConfig.validate?.required ?? false,
      dataSource: initialConfig.properties?.dataSource ?? 'freetext',
      credentialMode: initialConfig.properties?.credentialMode ?? 'optional',
      options: initialConfig.properties?.options?.join('\n') ?? '',
      vcMapping: {
        credentialType: initialConfig.properties?.vcMapping?.credentialType ?? '',
        attributeName: initialConfig.properties?.vcMapping?.attributeName ?? ''
      }
    });

    // Log populated values for debugging
    setTimeout(() => {
      console.log('[config-modal populated]', getValues());
    }, 100);
  }, [initialConfig, isOpen, reset, getValues]);

  const { data: credentialTemplates } = useQuery({
    queryKey: ['/api/cred-lib'],
    queryFn: async () => {
      const response = await fetch('/api/cred-lib');
      if (!response.ok) throw new Error('Failed to fetch credentials');
      return response.json();
    },
    enabled: isOpen
  });

  // Get selected credential template ID
  const selectedTemplateId = credentialTemplates?.find((t: any) => t.label === watchedCredentialType)?.id;

  // Fetch credential attributes for the selected template
  const { data: attrs, isLoading: attrsLoading } = useQuery({
    queryKey: ['cred-attrs', selectedTemplateId],
    queryFn: async () => {
      const response = await fetch(`/api/cred-lib/${selectedTemplateId}`);
      if (!response.ok) throw new Error('Failed to fetch credential template');
      const template = await response.json();
      return template.attributes || [];
    },
    enabled: Boolean(selectedTemplateId)
  });

  // Reset attribute mapping when credential template changes
  useEffect(() => {
    setValue('vcMapping.attributeName', '');
  }, [selectedTemplateId, setValue]);

  // Restore saved attribute name after attributes load (race condition fix)
  useEffect(() => {
    if (attrs && attrs.length > 0 && initialConfig?.properties?.vcMapping?.attributeName) {
      const savedAttributeName = initialConfig.properties.vcMapping.attributeName;
      console.log('[config-modal] restoring saved attribute name:', savedAttributeName);
      setValue('vcMapping.attributeName', savedAttributeName, { shouldDirty: false });
    }
  }, [attrs, initialConfig?.properties?.vcMapping?.attributeName, setValue]);

  const handleSave = handleSubmit((data) => {
    const fieldConfig = {
      label: data.label,
      placeholder: data.placeholder,
      description: data.description,
      validate: {
        required: data.required
      },
      properties: {
        dataSource: data.dataSource,
        credentialMode: data.credentialMode,
        ...(data.dataSource === 'picklist' && {
          options: data.options.split('\n').filter(opt => opt.trim())
        }),
        ...(data.dataSource === 'verified' && {
          vcMapping: {
            credentialType: data.vcMapping.credentialType,
            attributeName: data.vcMapping.attributeName
          }
        })
      }
    };
    onSave(fieldConfig);
    onClose();
  });

  const getCredentialTypes = () => {
    return credentialTemplates?.map((template: any) => ({
      value: template.label,
      label: template.label
    })) || [];
  };

  const getCredentialAttributes = () => {
    return attrs || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Field</DialogTitle>
          <DialogDescription id="field-config-desc">
            Configure how this form field pulls data from a credential.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
            
            <div>
              <Label htmlFor="label">Field Label *</Label>
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="label"
                    placeholder="Enter field label"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Controller
                name="placeholder"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="placeholder"
                    placeholder="Enter placeholder text"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="description">Help Text</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    rows={2}
                    placeholder="Optional help text for users"
                  />
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="required"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="required"
                  />
                )}
              />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>

          {/* Data Source Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Data Source</h4>
            <div>
              <Label htmlFor="dataSource">How should users provide this information?</Label>
              <Controller
                name="dataSource"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger ref={field.ref}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freetext">Free Text Only - User enters value manually</SelectItem>
                      <SelectItem value="picklist">Pick List - User selects from predefined options</SelectItem>
                      <SelectItem value="verified">Verifiable Credential - Auto-filled or manual entry</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Credential Mode Configuration */}
            {watchedDataSource === 'verified' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Credential Verification Mode</h4>
                <Controller
                  name="credentialMode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Optional - User can present credential OR type manually</SelectItem>
                        <SelectItem value="required">Required - User must present valid credential</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {watch('credentialMode') === 'optional' 
                    ? "Users can choose to verify with a credential or fill manually. Field will auto-populate if credential is presented."
                    : "Users must present a valid credential to proceed. Manual entry is not allowed for this field."
                  }
                </p>
              </div>
            )}

            {/* Pick List Configuration */}
            {watchedDataSource === 'picklist' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Pick List Options</h5>
                <div>
                  <Label htmlFor="options">Options (one per line)</Label>
                  <Controller
                    name="options"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="options"
                        rows={4}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Verified Attribute Configuration */}
            {watchedDataSource === 'verified' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Attribute Configuration
                </h5>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credentialType">Select from Credential Catalogue</Label>
                    <Controller
                      name="vcMapping.credentialType"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setValue('vcMapping.attributeName', ''); // Reset attribute when credential changes
                          }}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Choose a credential from your catalogue..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getCredentialTypes().map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{type.label}</span>
                                  <span className="text-xs text-gray-500">
                                    {type.value === 'BC Person Credential' && 'BC Government issued identity credential'}
                                    {type.value === 'BC Digital Business Card' && 'BC Government business registration credential'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {watchedCredentialType && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Selected: {watchedCredentialType}
                      </p>
                    )}
                  </div>
                  
                  {watchedCredentialType && (
                    <div>
                      <Label htmlFor="attributeName">Map to Attribute</Label>
                      <Controller
                        name="vcMapping.attributeName"
                        control={control}
                        render={({ field }) => (
                          <Select 
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={attrsLoading || !watchedCredentialType}
                          >
                            <SelectTrigger ref={field.ref}>
                              <SelectValue 
                                placeholder={
                                  attrsLoading 
                                    ? "Loading attributes..." 
                                    : !watchedCredentialType 
                                      ? "Select a credential type first"
                                      : getCredentialAttributes().length === 0
                                        ? "No attributes found"
                                        : "Select which attribute to map to this field..."
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {getCredentialAttributes().map((attr: any) => (
                                <SelectItem key={attr.name} value={attr.name}>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{attr.name}</span>
                                    {attr.description && (
                                      <span className="text-xs text-gray-500">{attr.description}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {watch('vcMapping.attributeName') && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Mapped to: {watch('vcMapping.attributeName')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}