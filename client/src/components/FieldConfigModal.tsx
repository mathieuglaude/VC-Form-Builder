import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface FieldConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig?: any;
}

export default function FieldConfigModal({ isOpen, onClose, onSave, initialConfig }: FieldConfigModalProps) {
  const [config, setConfig] = useState({
    label: '',
    key: '',
    required: false,
    dataSource: 'freetext',
    options: '',
    credentialType: '',
    attributeName: '',
    issuerDid: ''
  });

  const { data: credentialDefs } = useQuery({
    queryKey: ['/api/credentials/defs'],
    enabled: isOpen
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        label: initialConfig.label || '',
        key: initialConfig.key || '',
        required: initialConfig.validate?.required || false,
        dataSource: initialConfig.properties?.dataSource || 'freetext',
        options: initialConfig.properties?.options?.join('\n') || '',
        credentialType: initialConfig.properties?.vcMapping?.credentialType || '',
        attributeName: initialConfig.properties?.vcMapping?.attributeName || '',
        issuerDid: initialConfig.properties?.vcMapping?.issuerDid || ''
      });
    } else {
      setConfig({
        label: '',
        key: '',
        required: false,
        dataSource: 'freetext',
        options: '',
        credentialType: '',
        attributeName: '',
        issuerDid: ''
      });
    }
  }, [initialConfig, isOpen]);

  const handleSave = () => {
    const fieldConfig = {
      label: config.label,
      key: config.key,
      validate: {
        required: config.required
      },
      properties: {
        dataSource: config.dataSource,
        ...(config.dataSource === 'picklist' && {
          options: config.options.split('\n').filter(opt => opt.trim())
        }),
        ...(config.dataSource === 'verified' && {
          vcMapping: {
            credentialType: config.credentialType,
            attributeName: config.attributeName,
            issuerDid: config.issuerDid || undefined
          }
        })
      }
    };

    onSave(fieldConfig);
    onClose();
  };

  const getCredentialAttributes = () => {
    if (!credentialDefs || !config.credentialType) return [];
    
    // Look for attributes in both local and API credential definitions
    const allDefs = [
      ...(credentialDefs.local || []),
      ...(credentialDefs.api?.credentialTypes || [])
    ];
    
    const selectedDef = allDefs.find(def => 
      def.credentialType === config.credentialType || def.type === config.credentialType
    );
    
    return selectedDef?.attributes || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Field Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Properties */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Properties</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="label">Field Label</Label>
                <Input
                  id="label"
                  value={config.label}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="key">Field Key</Label>
                <Input
                  id="key"
                  value={config.key}
                  onChange={(e) => setConfig({ ...config, key: e.target.value })}
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
            </div>
          </div>

          {/* Data Source Configuration */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Data Source Type</h4>
            <RadioGroup 
              value={config.dataSource} 
              onValueChange={(value) => setConfig({ ...config, dataSource: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="freetext" id="freetext" />
                <Label htmlFor="freetext" className="space-y-1">
                  <div className="font-medium">Free Text</div>
                  <div className="text-xs text-gray-500">User enters value manually</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="picklist" id="picklist" />
                <Label htmlFor="picklist" className="space-y-1">
                  <div className="font-medium">Pick List</div>
                  <div className="text-xs text-gray-500">User selects from predefined options</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verified" id="verified" />
                <Label htmlFor="verified" className="space-y-1">
                  <div className="font-medium">Verified Attribute</div>
                  <div className="text-xs text-gray-500">Auto-filled from verifiable credential</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pick List Configuration */}
          {config.dataSource === 'picklist' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h5 className="text-sm font-medium text-gray-800 mb-3">Pick List Options</h5>
              <div>
                <Label htmlFor="options">Options (one per line)</Label>
                <Textarea
                  id="options"
                  rows={4}
                  value={config.options}
                  onChange={(e) => setConfig({ ...config, options: e.target.value })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            </div>
          )}

          {/* Verified Attribute Configuration */}
          {config.dataSource === 'verified' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verified Attribute Configuration
              </h5>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="credentialType">Credential Type</Label>
                  <Select value={config.credentialType} onValueChange={(value) => setConfig({ ...config, credentialType: value, attributeName: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select credential type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {credentialDefs?.local?.map((def: any) => (
                        <SelectItem key={def.id} value={def.credentialType}>{def.credentialType}</SelectItem>
                      ))}
                      {credentialDefs?.api?.credentialTypes?.map((def: any) => (
                        <SelectItem key={def.type} value={def.type}>{def.type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="attributeName">Attribute Name</Label>
                  <Select value={config.attributeName} onValueChange={(value) => setConfig({ ...config, attributeName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getCredentialAttributes().map((attr: any) => {
                        const attrName = typeof attr === 'string' ? attr : attr.name;
                        const attrDesc = typeof attr === 'string' ? attr : attr.description;
                        return (
                          <SelectItem key={attrName} value={attrName}>
                            {attrDesc || attrName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issuerDid">Issuer DID (Optional)</Label>
                  <Input
                    id="issuerDid"
                    value={config.issuerDid}
                    onChange={(e) => setConfig({ ...config, issuerDid: e.target.value })}
                    placeholder="did:example:issuer123..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to accept credentials from any issuer</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
