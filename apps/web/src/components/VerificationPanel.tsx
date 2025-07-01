import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, QrCode, ExternalLink, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationPanelProps {
  proofId: string;
  onCancel?: () => void;
}

export default function VerificationPanel({ proofId, onCancel }: VerificationPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Fetch QR code SVG and invitation URL
  const { data: qrResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['qr-code', proofId],
    queryFn: async () => {
      // Get the SVG directly from the API
      const svgResponse = await fetch(`/api/proofs/${proofId}/qr`);
      if (!svgResponse.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const svg = await svgResponse.text();
      
      // For now, use a mock invitation URL - in real implementation this would come from Orbit
      const invitationUrl = `https://example.org/mock/${proofId}`;
      
      return { svg, invitationUrl };
    },
    enabled: !!proofId && isVisible,
    retry: 2
  });

  if (!isVisible) {
    return null;
  }

  const handleCancel = () => {
    setIsVisible(false);
    onCancel?.();
  };

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Credential Verification
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Generating verification QR code...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                Could not generate verification QR code. Please try again.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Success State - Display QR Code */}
        {qrResponse && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Scan with your digital wallet to verify credentials
              </p>
              
              {/* QR Code Display */}
              <div className="flex justify-center mb-4">
                <div className="w-64 h-64 bg-white rounded-lg border shadow-sm p-2 flex items-center justify-center">
                  {qrResponse.svg ? (
                    <img
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(qrResponse.svg)}`}
                      alt="Verification QR Code"
                      className="w-full h-full object-contain"
                      style={{ maxWidth: '250px', maxHeight: '250px' }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <QrCode className="w-16 h-16 mb-2" />
                      <span className="text-sm">QR Code Loading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Open in Wallet Button */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(qrResponse.invitationUrl, '_blank')}
                  className="w-full flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Wallet
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="w-full text-sm text-gray-500"
                >
                  Cancel Verification
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}