import React, { useState } from 'react';
import { useOCABranding, useOCAPreview, useRefreshOCABundle } from '@/hooks/useOCABranding';
import { OCACredentialCard, OCACredentialCardPreview } from '@/components/oca/OCACredentialCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function OCADemo() {
  const [selectedCredentialId, setSelectedCredentialId] = useState<number>(4); // BC Lawyer Credential

  // Fetch available credentials
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await fetch('/api/cred-lib');
      if (!response.ok) throw new Error('Failed to fetch credentials');
      return response.json();
    }
  });

  // Fetch OCA branding for selected credential
  const { data: branding, isLoading: isLoadingBranding, refetch: refetchBranding } = useOCABranding(selectedCredentialId);
  
  // Fetch OCA preview data
  const { data: preview, isLoading: isLoadingPreview } = useOCAPreview(selectedCredentialId);
  
  // Refresh mutation
  const refreshMutation = useRefreshOCABundle();

  const selectedCredential = credentials?.find((c: any) => c.id === selectedCredentialId);

  const handleRefresh = () => {
    refreshMutation.mutate(selectedCredentialId, {
      onSuccess: () => {
        refetchBranding();
      }
    });
  };

  const sampleCredentialData = {
    given_names: 'Sarah',
    surname: 'Johnson',
    member_status: 'Active Practising',
    credential_type: 'Lawyer',
    public_person_id: 'PPID-12345',
    business_name: 'Digital Solutions Corp',
    business_type: 'Technology Consulting'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OCA Bundle Integration Demo
          </h1>
          <p className="text-gray-600">
            Demonstrates the OCA (Overlays Capture Architecture) bundle integration with BC Government credentials.
            This system fetches authentic branding data from the BC Government's aries-oca-bundles repository.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credential Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Credential</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCredentials ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {credentials?.filter((c: any) => c.isPredefined)?.map((credential: any) => (
                    <button
                      key={credential.id}
                      onClick={() => setSelectedCredentialId(credential.id)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedCredentialId === credential.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{credential.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {credential.ecosystem} • {credential.interopProfile}
                      </div>
                      {credential.brandingMetadata?.ocaBundleUrl && (
                        <Badge className="mt-2 text-xs">OCA Bundle Available</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* OCA Branding Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">OCA Branding Data</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
              >
                {refreshMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingBranding ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : branding ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">OCA Bundle Loaded</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Type:</span>
                      <div className="text-gray-600">{branding.type}</div>
                    </div>
                    <div>
                      <span className="font-medium">Repository:</span>
                      <div className="text-gray-600">{branding.repositoryId}</div>
                    </div>
                    <div>
                      <span className="font-medium">Primary Color:</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: branding.primary_background_color }}
                        />
                        <span className="text-gray-600">{branding.primary_background_color}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Assets:</span>
                      <div className="text-gray-600">{branding.assets?.length || 0} files</div>
                    </div>
                  </div>

                  {branding.assets && branding.assets.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-xs font-medium mb-2">Downloaded Assets:</div>
                      <div className="space-y-1">
                        {branding.assets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{asset.filename}</span>
                            <span className="text-gray-400">{asset.size ? `${Math.round(asset.size / 1024)}KB` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCredential?.brandingMetadata?.ocaBundleUrl && (
                    <div className="border-t pt-3">
                      <a
                        href={selectedCredential.brandingMetadata.ocaBundleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View OCA Bundle Repository</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500 mb-2">No OCA branding available</div>
                  <div className="text-xs text-gray-400">
                    This credential doesn't have an OCA bundle URL configured.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credential Card Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credential Card Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBranding ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : branding ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium mb-2">Banner Bottom</div>
                    <OCACredentialCard 
                      branding={branding}
                      credentialData={sampleCredentialData}
                      variant="banner-bottom"
                      size="small"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Banner Top</div>
                    <OCACredentialCard 
                      branding={branding}
                      credentialData={sampleCredentialData}
                      variant="banner-top"
                      size="small"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Minimal</div>
                    <OCACredentialCard 
                      branding={branding}
                      credentialData={sampleCredentialData}
                      variant="minimal"
                      size="small"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">No branding data to display</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full-size Card Display */}
        {branding && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Full-Size Credential Card</CardTitle>
              <p className="text-sm text-gray-600">
                Authentic OCA-branded credential card using real BC Government branding assets
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <OCACredentialCard 
                  branding={branding}
                  credentialData={sampleCredentialData}
                  variant="banner-bottom"
                  size="large"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">OCA Bundle Integration</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Fetches authentic branding from BC Government OCA bundles</li>
                  <li>• Downloads and caches logo and background images</li>
                  <li>• Applies official colors and layout specifications</li>
                  <li>• Supports multiple card layout variants</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Sources</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Repository:</strong> github.com/bcgov/aries-oca-bundles</li>
                  <li>• <strong>Branding Standard:</strong> OCA for Aries 1.0</li>
                  <li>• <strong>Governance:</strong> BC Digital Trust Toolkit</li>
                  <li>• <strong>Assets:</strong> Locally cached for performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}