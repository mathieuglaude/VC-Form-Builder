import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData, SchemaData, CredDefData } from '../GovernanceImportWizard';

interface CredDefSelectionStepProps {
  selectedSchema: SchemaData;
  governanceData: ParsedGovernanceData;
  data: CredDefData | null;
  onComplete: (data: CredDefData) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function CredDefSelectionStep({
  selectedSchema,
  governanceData,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: CredDefSelectionStepProps) {
  const [selectedCredDefId, setSelectedCredDefId] = useState<string>(data?.credDefId || '');
  const [credDefData, setCredDefData] = useState<CredDefData | null>(data);
  const [error, setError] = useState<string | null>(null);

  // Filter credential definitions that match the selected schema
  const compatibleCredDefs = governanceData.credentialDefinitions.filter(credDef => 
    credDef.schemaId === selectedSchema.schemaId || 
    credDef.id.includes(selectedSchema.schemaId.split(':')[0]) // Basic compatibility check
  );

  useEffect(() => {
    if (data) {
      setCredDefData(data);
      setSelectedCredDefId(data.credDefId);
    }
  }, [data]);

  const handleCredDefSelection = (credDefId: string) => {
    setSelectedCredDefId(credDefId);
    setCredDefData(null);
    setError(null);
  };

  const handleValidateCredDef = async () => {
    if (!selectedCredDefId) {
      setError('Please select a credential definition first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creddef/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credDefId: selectedCredDefId,
          schemaId: selectedSchema.schemaId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to validate credential definition`);
      }

      const validatedCredDef = await response.json();
      setCredDefData(validatedCredDef);
      onComplete(validatedCredDef);
    } catch (err) {
      console.error('Failed to validate credential definition:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate credential definition');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (credDefData) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Step 4: Select Credential Definition
          </CardTitle>
          <CardDescription>
            Choose a credential definition that matches the selected schema. This defines the issuer authority and validation rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-sm text-blue-900">Selected Schema</h4>
            <p className="text-sm text-blue-700 font-mono break-all">{selectedSchema.schemaId}</p>
            <p className="text-xs text-blue-600">{selectedSchema.name} v{selectedSchema.version}</p>
          </div>

          {compatibleCredDefs.length > 0 ? (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Compatible Credential Definitions</label>
                <RadioGroup
                  value={selectedCredDefId}
                  onValueChange={handleCredDefSelection}
                  disabled={isLoading}
                >
                  {compatibleCredDefs.map((credDef, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={credDef.id} id={`creddef-${index}`} className="mt-1" />
                      <Label htmlFor={`creddef-${index}`} className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{credDef.name}</span>
                            <Badge variant={credDef.environment === 'prod' ? 'default' : 'secondary'}>
                              {credDef.environment.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs font-mono text-gray-600 break-all">
                            {credDef.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Schema: {credDef.schemaId || 'Compatible with selected schema'}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleValidateCredDef}
                disabled={!selectedCredDefId || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating Credential Definition...
                  </>
                ) : (
                  'Validate Credential Definition'
                )}
              </Button>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No compatible credential definitions found for the selected schema. 
                The governance document may not include credential definitions, or they may be for a different schema.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {credDefData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Credential Definition Validated
            </CardTitle>
            <CardDescription>
              The credential definition has been validated against the selected schema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Credential Definition ID</h4>
                <p className="text-sm font-mono break-all">{credDefData.credDefId}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Schema ID</h4>
                <p className="text-sm font-mono break-all">{credDefData.schemaId}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Tag</h4>
                <p className="text-sm">{credDefData.tag}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Issuer DID</h4>
                <p className="text-sm font-mono break-all">{credDefData.issuerDid}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-gray-700">Validation Status:</h4>
              {credDefData.isValid ? (
                <Badge className="bg-green-100 text-green-800">Valid</Badge>
              ) : (
                <Badge variant="destructive">Invalid</Badge>
              )}
            </div>

            {credDefData.isValid && (
              <div className="pt-4 border-t">
                <Button onClick={handleContinue} className="w-full">
                  Continue to OCA Preview
                </Button>
              </div>
            )}

            {!credDefData.isValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The credential definition is not valid for the selected schema. 
                  Please select a different credential definition or go back to choose a different schema.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}