import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IssuanceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (actions: IssuanceAction[]) => void;
  initialActions?: IssuanceAction[];
  formFields: Array<{ key: string; label: string; type: string }>;
}

interface IssuanceAction {
  id: string;
  name: string;
  credDefId: string;
  attributeMapping: Record<string, string>;
  enabled: boolean;
}

export default function IssuanceActionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialActions = [], 
  formFields 
}: IssuanceActionModalProps) {
  const [actions, setActions] = useState<IssuanceAction[]>(initialActions);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [credDefs, setCredDefs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCredentialDefinitions();
    }
  }, [isOpen]);

  const fetchCredentialDefinitions = async () => {
    try {
      const response = await fetch('/api/cred-lib');
      if (response.ok) {
        const templates = await response.json();
        setCredDefs(templates);
      }
    } catch (error) {
      console.error('Failed to fetch credential definitions:', error);
    }
  };

  const addAction = () => {
    const newAction: IssuanceAction = {
      id: `action_${Date.now()}`,
      name: '',
      credDefId: '',
      attributeMapping: {},
      enabled: true
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (actionId: string) => {
    setActions(actions.filter(action => action.id !== actionId));
  };

  const updateAction = (actionId: string, updates: Partial<IssuanceAction>) => {
    setActions(actions.map(action => 
      action.id === actionId ? { ...action, ...updates } : action
    ));
  };

  const updateAttributeMapping = (actionId: string, credAttr: string, formField: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const newMapping = { ...action.attributeMapping };
      if (formField) {
        newMapping[credAttr] = formField;
      } else {
        delete newMapping[credAttr];
      }
      updateAction(actionId, { attributeMapping: newMapping });
    }
  };

  const getCredentialAttributes = (credDefId: string) => {
    const credDef = credDefs.find(cd => cd.id.toString() === credDefId);
    return credDef?.attributes || [];
  };

  const handleSave = () => {
    const validActions = actions.filter(action => 
      action.name && action.credDefId && Object.keys(action.attributeMapping).length > 0
    );
    
    onSave(validActions);
    onClose();
    
    toast({
      title: "Issuance Actions Saved",
      description: `Configured ${validActions.length} credential issuance action(s).`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Configure Credential Issuance Actions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Set up automatic credential issuance when forms are submitted. Map form fields to credential attributes.
          </p>

          {actions.map((action, index) => (
            <div key={action.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Issuance Action #{index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAction(action.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${action.id}`}>Action Name</Label>
                  <Input
                    id={`name-${action.id}`}
                    placeholder="e.g., Issue Employee Badge"
                    value={action.name}
                    onChange={(e) => updateAction(action.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor={`creddef-${action.id}`}>Credential Type</Label>
                  <Select
                    value={action.credDefId}
                    onValueChange={(value) => updateAction(action.id, { credDefId: value, attributeMapping: {} })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select credential type" />
                    </SelectTrigger>
                    <SelectContent>
                      {credDefs.map((credDef) => (
                        <SelectItem key={credDef.id} value={credDef.id.toString()}>
                          {credDef.label} v{credDef.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {action.credDefId && (
                <div>
                  <Label>Attribute Mapping</Label>
                  <div className="space-y-2 mt-2">
                    {getCredentialAttributes(action.credDefId).map((attr: any) => (
                      <div key={attr.name} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-32">{attr.name}:</span>
                        <Select
                          value={action.attributeMapping[attr.name] || ''}
                          onValueChange={(value) => updateAttributeMapping(action.id, attr.name, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select form field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No mapping</SelectItem>
                            {formFields.map((field) => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label} ({field.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addAction}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Issuance Action
          </Button>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Actions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}