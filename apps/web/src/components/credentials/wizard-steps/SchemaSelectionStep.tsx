import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, Database, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData, SchemaData } from '../GovernanceImportWizard';

interface SchemaSelectionStepProps {
  governanceData: ParsedGovernanceData;
  data: SchemaData | null;
  onComplete: (data: SchemaData) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function SchemaSelectionStep({
  governanceData,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: SchemaSelectionStepProps) {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(data?.schemaId || '');
  const [schemaData, setSchemaData] = useState<SchemaData | null>(data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setSchemaData(data);
      setSelectedSchemaId(data.schemaId);
    }
  }, [data]);

  const handleSchemaSelection = (schemaId: string) => {
    setSelectedSchemaId(schemaId);
    setSchemaData(null);
    setError(null);
  };

  const handleFetchSchemaData = async () => {
    if (!selectedSchemaId) {
      setError('Please select a schema first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/schema/candy/${encodeURIComponent(selectedSchemaId)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch schema data`);
      }

      const fetchedSchemaData = await response.json();
      setSchemaData(fetchedSchemaData);
      onComplete(fetchedSchemaData);
    } catch (err) {
      console.error('Failed to fetch schema data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schema data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (schemaData) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Step 3: Select Schema
          </CardTitle>
          <CardDescription>
            Choose a blockchain schema from the governance document. Schema data will be fetched from CANdy blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {governanceData.schemas.length > 0 ? (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Available Schemas</label>
                <RadioGroup
                  value={selectedSchemaId}
                  onValueChange={handleSchemaSelection}
                  disabled={isLoading}
                >
                  {governanceData.schemas.map((schema, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={schema.id} id={`schema-${index}`} className="mt-1" />
                      <Label htmlFor={`schema-${index}`} className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{schema.name}</span>
                            <Badge variant={schema.environment === 'prod' ? 'default' : 'secondary'}>
                              {schema.environment.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs font-mono text-gray-600 break-all">
                            {schema.id}
                          </div>
                          {schema.url && (
                            <div className="text-xs text-blue-600">
                              <a href={schema.url} target="_blank" rel="noopener noreferrer">
                                View on blockchain →
                              </a>
                            </div>
                          )}
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
                onClick={handleFetchSchemaData}
                disabled={!selectedSchemaId || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching Schema Data...
                  </>
                ) : (
                  'Fetch Schema Details'
                )}
              </Button>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No schemas found in the governance document. Please go back and check the document URL.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {schemaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Schema Data Retrieved
            </CardTitle>
            <CardDescription>
              Review the blockchain schema attributes (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Schema ID</h4>
                <p className="text-sm font-mono break-all">{schemaData.schemaId}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Schema Name</h4>
                <p className="text-sm">{schemaData.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Version</h4>
                <p className="text-sm">{schemaData.version}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Issuer DID</h4>
                <p className="text-sm font-mono break-all">{schemaData.issuerDid}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Schema Attributes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {schemaData.attributes.map((attr, index) => (
                  <div key={index} className="bg-gray-100 rounded p-2">
                    <div className="text-sm font-medium">{attr.name}</div>
                    <div className="text-xs text-gray-600">Type: {attr.type}</div>
                    {attr.restrictions && (
                      <div className="text-xs text-gray-500">Has restrictions</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleContinue} className="w-full">
                Continue to Credential Definition Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}