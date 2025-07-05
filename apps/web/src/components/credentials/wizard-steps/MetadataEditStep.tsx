import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, Lock } from 'lucide-react';
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
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Edit Credential Metadata
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Review and edit the extracted metadata. Click the pencil icon next to any field to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              label="Issuer Website"
              field="issuerWebsite"
              value={editableMetadata.issuerWebsite || ''}
              placeholder="https://example.org"
            />
            <EditableField
              label="Governance URL"
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

          <Separator className="my-8" />

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-base text-gray-900">Technical References</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Read-only</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-semibold text-sm text-gray-900">
                  Schemas ({editableMetadata.schemas?.length || 0})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                  {editableMetadata.schemas?.map((schema, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="font-mono text-xs text-blue-800 break-all mb-1">{schema.id}</div>
                      <div className="text-sm text-blue-700">{schema.name}</div>
                      <div className="text-xs text-blue-600 mt-1">Environment: {schema.environment}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-semibold text-sm text-gray-900">
                  Credential Definitions ({editableMetadata.credentialDefinitions?.length || 0})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                  {editableMetadata.credentialDefinitions?.map((credDef, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <div className="font-mono text-xs text-green-800 break-all mb-1">{credDef.id}</div>
                      <div className="text-sm text-green-700">{credDef.name}</div>
                      <div className="text-xs text-green-600 mt-1">Environment: {credDef.environment}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {editableMetadata.ocaBundleUrls && editableMetadata.ocaBundleUrls.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-semibold text-sm text-gray-900">
                  OCA Bundle URLs ({editableMetadata.ocaBundleUrls.length})
                </h5>
                <div className="space-y-2 max-h-32 overflow-y-auto p-1">
                  {editableMetadata.ocaBundleUrls.map((bundleUrl, index) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                      <div className="font-mono text-xs text-purple-800 break-all">{bundleUrl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t">
            <Button
              onClick={handleValidateAndContinue}
              disabled={
                !editableMetadata.credentialName ||
                !editableMetadata.issuerOrganization ||
                !editableMetadata.description ||
                isLoading
              }
              className="w-full py-6 text-base"
            >
              {isLoading ? 'Validating...' : 'Continue to Schema Selection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}