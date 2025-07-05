import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, AlertCircle, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedGovernanceData, BrandingAssets, CredDefData } from '../GovernanceImportWizard';

interface OCAPreviewStepProps {
  governanceData: ParsedGovernanceData;
  selectedCredDef: CredDefData | null;
  data: BrandingAssets | null;
  onComplete: (data: BrandingAssets) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function OCAPreviewStep({
  governanceData,
  selectedCredDef,
  data,
  onComplete,
  onNext,
  isLoading,
  setIsLoading,
}: OCAPreviewStepProps) {
  const [brandingAssets, setBrandingAssets] = useState<BrandingAssets | null>(data);
  const [error, setError] = useState<string | null>(null);

  // Smart filtering logic for OCA bundles based on selected credential definition environment
  const getFilteredOCABundles = () => {
    if (!selectedCredDef || !governanceData.ocaBundleUrls?.length) {
      return governanceData.ocaBundleUrls || [];
    }

    // Determine environment from selected credential definition
    const credDefEnvironment = detectEnvironmentFromCredDef(selectedCredDef.credDefId);
    
    // Filter OCA bundles to match the credential definition environment
    const filteredBundles = governanceData.ocaBundleUrls.filter(url => {
      const urlLower = url.toLowerCase();
      if (credDefEnvironment === 'test') {
        return urlLower.includes('/test') || urlLower.includes('-test');
      } else if (credDefEnvironment === 'prod') {
        return urlLower.includes('/prod') || (!urlLower.includes('/test') && !urlLower.includes('-test'));
      }
      return true; // If we can't determine, include all
    });

    return filteredBundles.length > 0 ? filteredBundles : governanceData.ocaBundleUrls;
  };

  // Helper function to detect environment from credential definition ID
  const detectEnvironmentFromCredDef = (credDefId: string): 'test' | 'prod' => {
    // Common test environment DID patterns
    const testPatterns = [
      'MLvtJW6pFuYu4NnMB14d29', // CANdy test DID prefix
      'test',
      'dev',
      'staging'
    ];
    
    // Common production environment DID patterns  
    const prodPatterns = [
      'QzLYGuAebsy3MXQ6b1sFiT', // CANdy prod DID prefix (BC Government)
      'prod',
      'production',
      'main'
    ];

    const credDefLower = credDefId.toLowerCase();
    
    // Check for test patterns first
    if (testPatterns.some(pattern => credDefLower.includes(pattern.toLowerCase()))) {
      return 'test';
    }
    
    // Check for production patterns
    if (prodPatterns.some(pattern => credDefLower.includes(pattern.toLowerCase()))) {
      return 'prod';
    }
    
    // Default to production if uncertain
    return 'prod';
  };

  useEffect(() => {
    if (data) {
      setBrandingAssets(data);
    }
  }, [data]);

  const handleDownloadAssets = async () => {
    setIsLoading(true);
    setError(null);

    // Use filtered OCA bundles based on selected credential definition environment
    const filteredBundles = getFilteredOCABundles();

    try {
      const response = await fetch('/api/oca/download-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocaBundleUrls: filteredBundles,
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
              {/* Environment Detection and Filtering Info */}
              {selectedCredDef && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-blue-900 mb-1">Smart Environment Filtering</h4>
                      <p className="text-xs text-blue-700">
                        Detected <span className="font-medium">{detectEnvironmentFromCredDef(selectedCredDef.credDefId)}</span> environment from credential definition
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-900">
                        {getFilteredOCABundles().length} / {governanceData.ocaBundleUrls.length}
                      </div>
                      <div className="text-xs text-blue-700">OCA bundles</div>
                    </div>
                  </div>
                  {getFilteredOCABundles().length !== governanceData.ocaBundleUrls.length && (
                    <div className="mt-2 text-xs text-blue-600">
                      ✓ Filtered to match {detectEnvironmentFromCredDef(selectedCredDef.credDefId)} environment
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {selectedCredDef ? 'Filtered OCA Bundle URLs' : 'OCA Bundle URLs'}
                </h4>
                <div className="space-y-2">
                  {getFilteredOCABundles().map((bundleUrl, index) => (
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