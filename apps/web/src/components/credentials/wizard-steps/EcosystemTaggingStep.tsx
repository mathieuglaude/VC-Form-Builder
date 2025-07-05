import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Tags, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData, SchemaData, CredDefData, BrandingAssets } from '../GovernanceImportWizard';

interface EcosystemTaggingStepProps {
  metadata: ParsedGovernanceData;
  schemaData: SchemaData;
  credDefData: CredDefData;
  brandingAssets: BrandingAssets;
  data: string;
  onComplete: (data: string) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onClose: () => void;
}

const predefinedEcosystems = [
  { id: 'bc-government', name: 'BC Government', description: 'British Columbia Government credentials' },
  { id: 'vancouver', name: 'City of Vancouver', description: 'City of Vancouver municipal credentials' },
  { id: 'canada-federal', name: 'Canada Federal', description: 'Government of Canada federal credentials' },
  { id: 'academic', name: 'Academic', description: 'Educational institutions and certifications' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical and healthcare providers' },
  { id: 'professional', name: 'Professional', description: 'Professional licensing and certification bodies' },
  { id: 'custom', name: 'Custom', description: 'Define your own ecosystem tag' },
];

export default function EcosystemTaggingStep({
  metadata,
  schemaData,
  credDefData,
  brandingAssets,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
  onClose,
}: EcosystemTaggingStepProps) {
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>(data || '');
  const [customEcosystem, setCustomEcosystem] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      if (predefinedEcosystems.find(eco => eco.id === data)) {
        setSelectedEcosystem(data);
      } else {
        setSelectedEcosystem('custom');
        setCustomEcosystem(data);
      }
    }
  }, [data]);

  const getFinalEcosystemTag = () => {
    if (selectedEcosystem === 'custom') {
      return customEcosystem.trim();
    }
    return predefinedEcosystems.find(eco => eco.id === selectedEcosystem)?.name || '';
  };

  const handleCompleteImport = async () => {
    const ecosystemTag = getFinalEcosystemTag();
    
    if (!ecosystemTag) {
      setError('Please select or enter an ecosystem tag');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/credentials/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          schemaData,
          credDefData,
          brandingAssets,
          ecosystemTag,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to import credential`);
      }

      const importedCredential = await response.json();
      console.log('Credential imported successfully:', importedCredential);
      
      setImportSuccess(true);
      onComplete(ecosystemTag);
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Failed to import credential:', err);
      setError(err instanceof Error ? err.message : 'Failed to import credential');
    } finally {
      setIsLoading(false);
    }
  };

  if (importSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold text-green-900">Import Successful!</h3>
        <p className="text-sm text-gray-600">
          The credential has been successfully imported into your library.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Step 6: Ecosystem Tagging
          </CardTitle>
          <CardDescription>
            Choose an ecosystem tag to categorize the credential. This helps organize credentials by their source and purpose.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Ecosystem</label>
            <RadioGroup
              value={selectedEcosystem}
              onValueChange={setSelectedEcosystem}
              disabled={isLoading}
            >
              {predefinedEcosystems.map((ecosystem) => (
                <div key={ecosystem.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={ecosystem.id} id={`ecosystem-${ecosystem.id}`} className="mt-1" />
                  <Label htmlFor={`ecosystem-${ecosystem.id}`} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="font-medium">{ecosystem.name}</div>
                      <div className="text-xs text-gray-600">{ecosystem.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedEcosystem === 'custom' && (
            <div className="space-y-2">
              <label htmlFor="custom-ecosystem" className="text-sm font-medium">
                Custom Ecosystem Tag
              </label>
              <Input
                id="custom-ecosystem"
                placeholder="Enter custom ecosystem name"
                value={customEcosystem}
                onChange={(e) => setCustomEcosystem(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Summary</CardTitle>
          <CardDescription>
            Review the credential before completing the import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700">Credential Details</h4>
              <div className="space-y-1">
                <div>Name: {metadata.credentialName}</div>
                <div>Issuer: {metadata.issuerOrganization}</div>
                <div>Ecosystem: <Badge variant="outline">{getFinalEcosystemTag()}</Badge></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Technical Details</h4>
              <div className="space-y-1 text-xs">
                <div>Schema: {schemaData.name} v{schemaData.version}</div>
                <div>Attributes: {schemaData.attributes.length} fields</div>
                <div>Valid Credential Definition: {credDefData.isValid ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 text-sm mb-2">Branding Assets</h4>
            <div className="flex items-center gap-4 text-xs">
              <div>Logo: {brandingAssets.logo ? 'Available' : 'None'}</div>
              <div>Background: {brandingAssets.backgroundImage ? 'Available' : 'None'}</div>
              <div>Primary Color: <span className="font-mono">{brandingAssets.colors?.primary || 'Default'}</span></div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleCompleteImport}
              disabled={!getFinalEcosystemTag() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing Credential...
                </>
              ) : (
                'Complete Import'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}