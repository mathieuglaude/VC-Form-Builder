import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, AlertCircle, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData, BrandingAssets } from '../GovernanceImportWizard';

interface OCAPreviewStepProps {
  governanceData: ParsedGovernanceData;
  data: BrandingAssets | null;
  onComplete: (data: BrandingAssets) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function OCAPreviewStep({
  governanceData,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: OCAPreviewStepProps) {
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets | null>(data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setBrandingAssets(data);
    }
  }, [data]);

  const handleDownloadAssets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oca/download-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocaBundleUrls: governanceData.ocaBundleUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to download OCA assets`);
      }

      const assets = await response.json();
      setBrandingAssets(assets);
      onComplete(assets);
    } catch (err) {
      console.error('Failed to download OCA assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to download OCA assets');
      
      // Provide fallback assets if download fails
      const fallbackAssets: BrandingAssets = {
        colors: {
          primary: '#4F46E5',
          secondary: '#6B7280'
        },
        layout: 'default'
      };
      setBrandingAssets(fallbackAssets);
      onComplete(fallbackAssets);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (brandingAssets) {
      onNext();
    }
  };

  const renderCredentialPreview = () => {
    if (!brandingAssets) return null;

    return (
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div 
          className="h-40 rounded-lg mb-4 flex items-center justify-center"
          style={{ 
            backgroundColor: brandingAssets.colors?.primary || '#4F46E5',
            backgroundImage: brandingAssets.backgroundImage ? `url(${brandingAssets.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {brandingAssets.logo ? (
            <img 
              src={brandingAssets.logo} 
              alt="Credential Logo" 
              className="max-h-20 max-w-40 object-contain"
            />
          ) : (
            <div className="text-white text-lg font-medium">
              {governanceData.issuerOrganization}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{governanceData.credentialName}</h3>
          <p className="text-sm text-gray-600">{governanceData.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Issued by {governanceData.issuerOrganization}</span>
            <span>Layout: {brandingAssets.layout}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Step 5: Preview OCA Assets
          </CardTitle>
          <CardDescription>
            Download and preview the visual branding assets from OCA (Overlays Capture Architecture) bundles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {governanceData.ocaBundleUrls.length > 0 ? (
            <>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">OCA Bundle URLs</h4>
                <div className="space-y-2">
                  {governanceData.ocaBundleUrls.map((bundleUrl, index) => (
                    <div key={index} className="text-xs bg-gray-100 rounded p-2 font-mono">
                      {bundleUrl}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                    <br />
                    <span className="text-xs">Continuing with default branding assets.</span>
                  </AlertDescription>
                </Alert>
              )}

              {!brandingAssets && (
                <Button
                  onClick={handleDownloadAssets}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading OCA Assets...
                    </>
                  ) : (
                    'Download OCA Assets'
                  )}
                </Button>
              )}
            </>
          ) : (
            <Alert>
              <Palette className="h-4 w-4" />
              <AlertDescription>
                No OCA bundle URLs found in the governance document. Using default branding.
              </AlertDescription>
            </Alert>
          )}

          {!brandingAssets && governanceData.ocaBundleUrls.length === 0 && (
            <Button
              onClick={() => {
                const defaultAssets: BrandingAssets = {
                  colors: {
                    primary: '#4F46E5',
                    secondary: '#6B7280'
                  },
                  layout: 'default'
                };
                setBrandingAssets(defaultAssets);
                onComplete(defaultAssets);
              }}
              className="w-full"
            >
              Continue with Default Branding
            </Button>
          )}
        </CardContent>
      </Card>

      {brandingAssets && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-green-500" />
              Credential Preview
            </CardTitle>
            <CardDescription>
              Preview how the credential will appear with the downloaded branding assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderCredentialPreview()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">Branding Details</h4>
                <div className="space-y-1 text-xs">
                  <div>Primary Color: <span className="font-mono">{brandingAssets.colors?.primary || 'None'}</span></div>
                  <div>Secondary Color: <span className="font-mono">{brandingAssets.colors?.secondary || 'None'}</span></div>
                  <div>Layout: {brandingAssets.layout || 'Default'}</div>
                  <div>Logo: {brandingAssets.logo ? 'Available' : 'None'}</div>
                  <div>Background: {brandingAssets.backgroundImage ? 'Available' : 'None'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Asset Sources</h4>
                <div className="space-y-1 text-xs">
                  {brandingAssets.logo && (
                    <div>Logo URL: <span className="font-mono break-all">{brandingAssets.logo}</span></div>
                  )}
                  {brandingAssets.backgroundImage && (
                    <div>Background URL: <span className="font-mono break-all">{brandingAssets.backgroundImage}</span></div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleContinue} className="w-full">
                Continue to Ecosystem Tagging
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}