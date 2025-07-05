import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData } from '../GovernanceImportWizard';

interface GovernanceDocumentStepProps {
  data: ParsedGovernanceData | null;
  onComplete: (data: ParsedGovernanceData) => void;
  onNext: () => void;
  onStepAdvance?: () => void;
  onValidationChange?: (isValid: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function GovernanceDocumentStep({
  data,
  onComplete,
  onNext,
  onStepAdvance,
  onValidationChange,
  isLoading,
  setIsLoading,
}: GovernanceDocumentStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedGovernanceData | null>(data);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (data) {
      setParsedData(data);
    }
  }, [data]);

  // Notify wizard of validation state changes
  useEffect(() => {
    const isValid = file !== null || parsedData !== null;
    onValidationChange?.(isValid);
  }, [file, parsedData, onValidationChange]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.md')) {
      setError('Please select a markdown (.md) file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleParseDocument = async () => {
    if (!file) {
      setError('Please select a governance document file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      if (!content.trim()) {
        throw new Error('File appears to be empty');
      }

      const response = await fetch('/api/governance/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to parse governance document`);
      }

      const governanceData = await response.json();
      setParsedData(governanceData);
      onComplete(governanceData);
      onNext(); // Automatically proceed to next step
    } catch (err) {
      console.error('Failed to parse governance document:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse governance document');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setParsedData(null);
  };

  const handleNext = async () => {
    if (parsedData) {
      // Data already parsed, advance to next step
      onStepAdvance?.();
    } else if (file) {
      // Parse the file and advance to next step
      await handleParseDocument();
      // After parsing completes, advance to next step
      onStepAdvance?.();
    } else {
      setError('Please select a governance document file');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            Upload Governance Document
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Upload a markdown (.md) file containing credential governance documentation to automatically extract 
            metadata, schema references, and OCA bundle information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="governance-file" className="block text-sm font-medium text-gray-900">
              Governance Document File
            </label>
            
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your .md file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports markdown files up to 5MB
                </p>
                <input
                  id="governance-file"
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('governance-file')?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Supported Documents</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• BC Government credential governance documents</li>
              <li>• Municipal governance documents (Vancouver, etc.)</li>
              <li>• Any markdown governance document with technical specifications</li>
              <li>• Documents containing schema IDs, credential definition IDs, and OCA bundle URLs</li>
            </ul>
          </div>


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
                      <div className="font-mono text-xs text-blue-800 break-all overflow-hidden">{schema.id}</div>
                      <div className="text-sm text-blue-700 mt-1 break-words">{schema.name} ({schema.environment})</div>
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
                onClick={handleNext}
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