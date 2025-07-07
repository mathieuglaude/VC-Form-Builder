import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, QrCode, Smartphone, ExternalLink } from 'lucide-react';

interface VerificationPanelProps {
  proofData: {
    proofId: string;
    qrCodeSvg: string;
    invitationUrl: string;
    status?: string;
  };
  onVerified: (verifiedData: Record<string, any>) => void;
  className?: string;
}

export default function VerificationPanel({ 
  proofData, 
  onVerified, 
  className = '' 
}: VerificationPanelProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');

  useEffect(() => {
    if (!proofData?.proofId) return;

    // Set up WebSocket connection for real-time verification updates
    const ws = new WebSocket(`ws://localhost:5000/ws`);
    
    ws.onopen = () => {
      console.log('[WS] Connected to verification WebSocket');
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        proofId: proofData.proofId 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Received verification update:', data);
        
        if (data.type === 'proof_verified' && data.proofId === proofData.proofId) {
          setIsVerified(true);
          setVerificationStatus('verified');
          onVerified(data.verifiedFields || {});
        }
      } catch (error) {
        console.error('[WS] Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WS] WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [proofData?.proofId, onVerified]);

  const openInWallet = () => {
    if (proofData?.invitationUrl) {
      window.open(proofData.invitationUrl, '_blank');
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Credential Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified Successfully
            </Badge>
            <p className="text-sm text-gray-600">
              Your credentials have been verified and form fields have been automatically populated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                {verificationStatus === 'pending' ? 'Waiting for Verification' : 'Processing...'}
              </Badge>
              <p className="text-sm text-gray-600 mb-4">
                Scan the QR code with your digital wallet to verify your credentials.
              </p>
            </div>
            
            {proofData?.qrCodeSvg && (
              <div className="flex justify-center">
                <div 
                  className="w-64 h-64 border rounded-lg p-2 bg-white"
                  dangerouslySetInnerHTML={{ __html: proofData.qrCodeSvg }}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={openInWallet}
                className="w-full"
                variant="outline"
                disabled={!proofData?.invitationUrl}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Open in Wallet
              </Button>
              
              {import.meta.env.DEV && proofData?.invitationUrl && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Debug: View Invitation URL
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs break-all">
                    {proofData.invitationUrl}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}