import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, QrCode, ExternalLink, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationPanelProps {
  form: any;
  onVerificationComplete?: (verifiedAttributes: Record<string, any>) => void;
}

interface ProofRequest {
  proofRequestId: string;
}

interface QRCodeData {
  qrSvg: string;
  inviteUrl: string;
}

export default function VerificationPanel({ form, onVerificationComplete }: VerificationPanelProps) {
  const [proofRequestId, setProofRequestId] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verifiedAttributes, setVerifiedAttributes] = useState<Record<string, string>>({});

  console.log('[VerificationPanel] Form:', form.id, { needsVC: needsVerificationCredentials(form) });

  // Check if form needs verification credentials
  function needsVerificationCredentials(form: any): boolean {
    const formSchema = form?.formSchema || form?.formDefinition;
    if (!formSchema?.components) return false;
    
    return formSchema.components.some((component: any) => 
      component.vcMapping?.credentialType && component.vcMapping?.attributeName
    );
  }

  // Don't render if no VC requirements
  if (!needsVerificationCredentials(form)) {
    console.log('[VerificationPanel] No VC requirements, not rendering');
    return null;
  }

  // Initialize proof request
  const initProofMutation = useMutation({
    mutationFn: async () => {
      console.log('[VerificationPanel] Initializing proof request...');
      const response = await fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: form.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data: ProofRequest) => {
      console.log('[VerificationPanel] Proof request initialized:', data.proofRequestId);
      setProofRequestId(data.proofRequestId);
    },
    onError: (error: any) => {
      console.error('[VerificationPanel] Proof initialization failed:', error.message);
    }
  });

  // Fetch QR code once we have proof request ID
  const { data: qrData, isLoading: qrLoading, error: qrError } = useQuery<QRCodeData>({
    queryKey: ['/api/proofs/qr', proofRequestId],
    queryFn: async () => {
      console.log('[VerificationPanel] Fetching QR code for:', proofRequestId);
      const response = await fetch(`/api/proofs/${proofRequestId}/qr`);
      if (!response.ok) throw new Error('Failed to fetch QR code');
      return response.json();
    },
    enabled: !!proofRequestId && !verificationComplete,
    retry: false
  });

  // Poll for proof status
  const { data: proofStatus } = useQuery({
    queryKey: ['/api/proofs/status', proofRequestId],
    queryFn: async () => {
      const response = await fetch(`/api/proofs/${proofRequestId}`);
      if (!response.ok) throw new Error('Failed to fetch proof status');
      return response.json();
    },
    enabled: !!proofRequestId && !verificationComplete,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: false
  });

  // Handle verification completion
  useEffect(() => {
    if (proofStatus?.status === 'verified' && proofStatus.attributes && !verificationComplete) {
      console.log('[VerificationPanel] Verification completed with attributes:', proofStatus.attributes);
      setVerifiedAttributes(proofStatus.attributes);
      setVerificationComplete(true);
      onVerificationComplete?.(proofStatus.attributes);
    }
  }, [proofStatus, verificationComplete, onVerificationComplete]);

  // Loading state
  if (initProofMutation.isPending) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Initializing Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Preparing credential verification...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (initProofMutation.error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-600" />
            Verification Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to initialize credential verification: {initProofMutation.error.message}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => initProofMutation.mutate()} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verification completed state
  if (verificationComplete) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            Credentials Verified Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-green-700 mb-3">
              Your credentials have been verified and the form fields below have been automatically filled.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(verifiedAttributes).map(([key, value]) => (
                <Badge key={key} variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-green-600 mt-3">
              You can now continue filling out the rest of the form below.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // QR Code display state
  if (proofRequestId && qrData) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Verify Your Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600 mb-4">
              Scan the QR code with your digital wallet to verify your credentials
            </p>
            
            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div 
                className="bg-white p-4 rounded-lg border shadow-sm"
                dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
              />
            </div>

            {/* Alternative link */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => window.open(qrData.inviteUrl, '_blank')}
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Wallet
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Waiting for verification...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial state - start verification
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Credential Verification Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          This form requires credential verification to auto-fill certain fields.
        </p>
        <Button 
          onClick={() => initProofMutation.mutate()}
          className="w-full"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Start Verification
        </Button>
      </CardContent>
    </Card>
  );
}