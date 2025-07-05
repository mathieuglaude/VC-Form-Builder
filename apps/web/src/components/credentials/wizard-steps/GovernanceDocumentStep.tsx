import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData } from '../GovernanceImportWizard';

interface GovernanceDocumentStepProps {
  data: ParsedGovernanceData | null;
  onComplete: (data: ParsedGovernanceData) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function GovernanceDocumentStep({
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: GovernanceDocumentStepProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedGovernanceData | null>(data);

  useEffect(() => {
    if (data) {
      setParsedData(data);
    }
  }, [data]);

  const handleParseDocument = async () => {
    if (!url.trim()) {
      setError('Please enter a governance document URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/governance/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to parse governance document`);
      }

      const governanceData = await response.json();
      setParsedData(governanceData);
      onComplete(governanceData);
    } catch (err) {
      console.error('Failed to parse governance document:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse governance document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExample = () => {
    const exampleUrl = 'https://github.com/bcgov/digital-trust-toolkit/blob/main/docs/governance/justice/legal-professional/governance.md';
    setUrl(exampleUrl);
  };

  const handleContinue = () => {
    if (parsedData) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Step 1: Parse Governance Document
          </CardTitle>
          <CardDescription>
            Enter the URL of a governance document to automatically extract credential metadata, 
            schema references, and OCA bundle information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="governance-url" className="text-sm font-medium">
              Governance Document URL
            </label>
            <div className="flex gap-2">
              <Input
                id="governance-url"
                placeholder="https://github.com/bcgov/digital-trust-toolkit/blob/main/docs/governance/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                onClick={handleUseExample}
                disabled={isLoading}
              >
                Use Example
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Supported: BC Government governance documents, City of Vancouver documents
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleParseDocument}
            disabled={!url.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing Document...
              </>
            ) : (
              'Parse Governance Document'
            )}
          </Button>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Document Parsed Successfully
            </CardTitle>
            <CardDescription>
              Review the extracted information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Credential Name</h4>
                <p className="text-sm">{parsedData.credentialName}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Issuer Organization</h4>
                <p className="text-sm">{parsedData.issuerOrganization}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm text-gray-700">Description</h4>
                <p className="text-sm text-gray-600">{parsedData.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Schemas Found</h4>
                <div className="space-y-1">
                  {parsedData.schemas.map((schema, index) => (
                    <div key={index} className="text-xs bg-gray-100 rounded p-2">
                      <div className="font-mono">{schema.id}</div>
                      <div className="text-gray-600">{schema.name} ({schema.environment})</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Credential Definitions</h4>
                <div className="space-y-1">
                  {parsedData.credentialDefinitions.map((credDef, index) => (
                    <div key={index} className="text-xs bg-gray-100 rounded p-2">
                      <div className="font-mono">{credDef.id}</div>
                      <div className="text-gray-600">{credDef.name} ({credDef.environment})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {parsedData.ocaBundleUrls.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">OCA Bundle URLs</h4>
                <div className="space-y-1">
                  {parsedData.ocaBundleUrls.map((bundleUrl, index) => (
                    <div key={index} className="text-xs bg-gray-100 rounded p-2 font-mono">
                      {bundleUrl}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleContinue}
              className="w-full"
            >
              Continue to Edit Metadata
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}