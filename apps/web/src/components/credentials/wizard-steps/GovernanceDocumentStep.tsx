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
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            Parse Governance Document
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Enter the URL of a governance document to automatically extract credential metadata, 
            schema references, and OCA bundle information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="governance-url" className="block text-sm font-medium text-gray-900">
              Governance Document URL
            </label>
            <div className="flex gap-3">
              <Input
                id="governance-url"
                placeholder="https://github.com/bcgov/digital-trust-toolkit/blob/main/docs/governance/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleUseExample}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                Use Example
              </Button>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Supported: BC Government governance documents, City of Vancouver documents
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleParseDocument}
            disabled={!url.trim() || isLoading}
            className="w-full py-6 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Parsing Document...
              </>
            ) : (
              'Parse Governance Document'
            )}
          </Button>
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Document Parsed Successfully
            </CardTitle>
            <CardDescription className="text-base">
              Review the extracted information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Credential Name</h4>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">{parsedData.credentialName}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Issuer Organization</h4>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">{parsedData.issuerOrganization}</p>
              </div>
              <div className="lg:col-span-2 space-y-2">
                <h4 className="font-semibold text-sm text-gray-900">Description</h4>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md leading-relaxed">{parsedData.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">Schemas Found ({parsedData.schemas.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {parsedData.schemas.map((schema, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="font-mono text-xs text-blue-800 break-all">{schema.id}</div>
                      <div className="text-sm text-blue-700 mt-1">{schema.name} ({schema.environment})</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">Credential Definitions ({parsedData.credentialDefinitions.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {parsedData.credentialDefinitions.map((credDef, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <div className="font-mono text-xs text-green-800 break-all">{credDef.id}</div>
                      <div className="text-sm text-green-700 mt-1">{credDef.name} ({credDef.environment})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {parsedData.ocaBundleUrls.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900">OCA Bundle URLs ({parsedData.ocaBundleUrls.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {parsedData.ocaBundleUrls.map((bundleUrl, index) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                      <div className="font-mono text-xs text-purple-800 break-all">{bundleUrl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                onClick={handleContinue}
                className="w-full py-6 text-base"
              >
                Continue to Edit Metadata
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}