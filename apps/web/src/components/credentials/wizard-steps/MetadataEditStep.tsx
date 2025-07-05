import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit3, Save, Lock, FileText, Loader2, Sparkles } from 'lucide-react';
import { ParsedGovernanceData, GovernanceStepData } from '../GovernanceImportWizard';

interface MetadataEditStepProps {
  governanceData: GovernanceStepData;
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
  const [parsedData, setParsedData] = useState<ParsedGovernanceData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [editableMetadata, setEditableMetadata] = useState<Partial<ParsedGovernanceData>>(data || {});
  const [editingField, setEditingField] = useState<string | null>(null);

  // Fun facts about digital credentials to show during parsing
  const funFacts = [
    "Digital credentials use cryptographic signatures to prevent forgery - making them more secure than traditional paper documents.",
    "The first verifiable credential standard was published by the W3C in 2019, revolutionizing digital identity.",
    "Blockchain-based credentials can be verified instantly anywhere in the world without contacting the issuer.",
    "Self-sovereign identity puts you in control - you decide what information to share and when.",
    "Digital credentials reduce verification time from days to seconds, transforming industries like education and healthcare.",
    "Zero-knowledge proofs allow you to prove you meet requirements without revealing unnecessary personal information.",
    "The global digital identity market is expected to reach $49.5 billion by 2026, driven by digital credential adoption."
  ];

  // Check if we need to parse (governanceData has content) or we already have parsed data
  const needsParsing = governanceData && 'content' in governanceData && !parsedData;
  const isParsing = needsParsing && isLoading;

  useEffect(() => {
    if (needsParsing && !isLoading && !parsedData && !parseError) {
      console.log('Auto-triggering parsing for uploaded file');
      handleParseGovernanceDocument();
    }
  }, [needsParsing]); // Only depend on needsParsing to avoid infinite loops

  useEffect(() => {
    if (parsedData) {
      const initialMetadata = {
        credentialName: parsedData.credentialName,
        issuerOrganization: parsedData.issuerOrganization,
        issuerWebsite: parsedData.issuerWebsite || '',
        description: parsedData.description,
        governanceUrl: parsedData.governanceUrl || '',
        schemas: parsedData.schemas,
        credentialDefinitions: parsedData.credentialDefinitions,
        ocaBundleUrls: parsedData.ocaBundleUrls,
      };
      setEditableMetadata(initialMetadata);
    }
  }, [parsedData]);

  useEffect(() => {
    if (data) {
      setEditableMetadata(data);
    }
  }, [data]);

  // Cycle through fun facts every 3 seconds while parsing
  useEffect(() => {
    if (isParsing) {
      const interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isParsing, funFacts.length]);

  const handleParseGovernanceDocument = async () => {
    if (!('content' in governanceData)) return;

    setIsLoading(true);
    setParseError(null);

    try {
      // Create a timeout promise that rejects after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Parsing timeout - please try again')), 10000)
      );

      // Create the fetch promise
      const fetchPromise = fetch('/api/governance/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: governanceData.content }),
      });

      // Race between the timeout and the fetch
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to parse governance document`);
      }

      const parsed = await response.json();
      console.log('Parsing completed successfully:', parsed);
      setParsedData(parsed);
    } catch (err) {
      console.error('Failed to parse governance document:', err);
      setParseError(err instanceof Error ? err.message : 'Failed to parse governance document');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Show parsing UI if we need to parse
  if (isParsing || (needsParsing && !parsedData && !parseError)) {
    return (
      <div className="space-y-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              Analyzing Governance Document
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Our AI is extracting metadata, schemas, and technical specifications from your governance document...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">Parsing in progress...</span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="font-semibold text-purple-900 mb-2">Did you know?</h4>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        {funFacts[currentFactIndex]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if parsing failed
  if (parseError) {
    return (
      <div className="space-y-8">
        <Card className="shadow-sm border-red-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-red-700">
              <FileText className="w-5 h-5" />
              Parsing Failed
            </CardTitle>
            <CardDescription className="text-base leading-relaxed text-red-600">
              We encountered an issue while analyzing your governance document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{parseError}</p>
            </div>
            <Button
              onClick={handleParseGovernanceDocument}
              disabled={isLoading}
              className="w-full py-6 text-base"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show editing UI once we have parsed data or existing metadata
  const hasMetadata = parsedData || (editableMetadata.credentialName && editableMetadata.issuerOrganization);

  if (!hasMetadata) {
    return (
      <div className="space-y-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Edit3 className="w-5 h-5 text-blue-600" />
              No Metadata Available
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              No governance data is available for editing. Please go back to Step 1 and upload a governance document.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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