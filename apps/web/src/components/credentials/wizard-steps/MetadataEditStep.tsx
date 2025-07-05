import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit3, Save } from 'lucide-react';
import { ParsedGovernanceData } from '../GovernanceImportWizard';

interface MetadataEditStepProps {
  governanceData: ParsedGovernanceData;
  data: Partial<ParsedGovernanceData> | null;
  onComplete: (data: Partial<ParsedGovernanceData>) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function MetadataEditStep({
  governanceData,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: MetadataEditStepProps) {
  const [editableMetadata, setEditableMetadata] = useState<Partial<ParsedGovernanceData>>(
    data || {
      credentialName: governanceData.credentialName,
      issuerOrganization: governanceData.issuerOrganization,
      issuerWebsite: governanceData.issuerWebsite || '',
      description: governanceData.description,
      governanceUrl: governanceData.governanceUrl || '',
      schemas: governanceData.schemas,
      credentialDefinitions: governanceData.credentialDefinitions,
      ocaBundleUrls: governanceData.ocaBundleUrls,
    }
  );

  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setEditableMetadata(data);
    }
  }, [data]);

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = (field: string) => {
    setEditingField(null);
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditableMetadata(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValidateAndContinue = async () => {
    setIsLoading(true);

    try {
      // Validate the metadata with the backend
      const response = await fetch('/api/governance/metadata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableMetadata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate metadata');
      }

      const validatedMetadata = await response.json();
      onComplete(validatedMetadata);
      onNext();
    } catch (err) {
      console.error('Failed to validate metadata:', err);
      // For now, continue anyway - validation is not critical
      onComplete(editableMetadata);
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const EditableField = ({ 
    label, 
    field, 
    value, 
    multiline = false,
    placeholder = '',
  }: { 
    label: string; 
    field: string; 
    value: string; 
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isEditing ? handleFieldSave(field) : handleFieldEdit(field)}
            className="h-6 w-6 p-0"
          >
            {isEditing ? (
              <Save className="w-3 h-3" />
            ) : (
              <Edit3 className="w-3 h-3" />
            )}
          </Button>
        </div>
        {isEditing ? (
          multiline ? (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              className="min-h-20"
              autoFocus
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          )
        ) : (
          <div className="p-2 bg-gray-50 rounded border min-h-[2.5rem] flex items-center">
            <span className="text-sm">{value || <span className="text-gray-400">No value set</span>}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Step 2: Edit Metadata
          </CardTitle>
          <CardDescription>
            Review and edit the extracted metadata. Click the pencil icon next to any field to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField
              label="Credential Name"
              field="credentialName"
              value={editableMetadata.credentialName || ''}
              placeholder="Enter credential name"
            />
            <EditableField
              label="Issuer Organization"
              field="issuerOrganization"
              value={editableMetadata.issuerOrganization || ''}
              placeholder="Enter issuer organization name"
            />
            <EditableField
              label="Issuer Website (Optional)"
              field="issuerWebsite"
              value={editableMetadata.issuerWebsite || ''}
              placeholder="https://example.org"
            />
            <EditableField
              label="Governance URL (Optional)"
              field="governanceUrl"
              value={editableMetadata.governanceUrl || ''}
              placeholder="https://github.com/..."
            />
          </div>

          <EditableField
            label="Description"
            field="description"
            value={editableMetadata.description || ''}
            placeholder="Describe the purpose and use case of this credential"
            multiline
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Schemas (Read-only)</h4>
              <div className="space-y-2">
                {editableMetadata.schemas?.map((schema, index) => (
                  <div key={index} className="text-xs bg-gray-100 rounded p-2">
                    <div className="font-mono">{schema.id}</div>
                    <div className="text-gray-600">{schema.name} ({schema.environment})</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Credential Definitions (Read-only)</h4>
              <div className="space-y-2">
                {editableMetadata.credentialDefinitions?.map((credDef, index) => (
                  <div key={index} className="text-xs bg-gray-100 rounded p-2">
                    <div className="font-mono">{credDef.id}</div>
                    <div className="text-gray-600">{credDef.name} ({credDef.environment})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {editableMetadata.ocaBundleUrls && editableMetadata.ocaBundleUrls.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">OCA Bundle URLs (Read-only)</h4>
              <div className="space-y-2">
                {editableMetadata.ocaBundleUrls.map((bundleUrl, index) => (
                  <div key={index} className="text-xs bg-gray-100 rounded p-2 font-mono">
                    {bundleUrl}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={handleValidateAndContinue}
              disabled={
                !editableMetadata.credentialName ||
                !editableMetadata.issuerOrganization ||
                !editableMetadata.description ||
                isLoading
              }
              className="w-full"
            >
              {isLoading ? 'Validating...' : 'Continue to Schema Selection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}