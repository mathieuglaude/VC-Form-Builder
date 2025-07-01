import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, QrCode, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormConfig {
  id: number;
  name: string;
  slug: string;
  purpose: string;
  logoUrl?: string;
  formDefinition: any;
  hasVerifiableCredentials: boolean;
  publishedAt: string | null;
  transport: 'connection' | 'oob' | null;
}

interface ProofRequest {
  proofRequestId: string;
}

interface QRCodeData {
  qrSvg: string;
  inviteUrl: string;
}

function FormLaunchPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [proofRequestId, setProofRequestId] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verifiedAttributes, setVerifiedAttributes] = useState<Record<string, string>>({});

  // Fetch form configuration
  const { data: form, isLoading: formLoading, error: formError } = useQuery<FormConfig>({
    queryKey: ['/api/forms', id],
    queryFn: async () => {
      const response = await fetch(`/api/forms/${id}`);
      if (!response.ok) {
        throw new Error('Form not found');
      }
      return response.json();
    },
    enabled: !!id
  });

  // Initialize proof request mutation
  const initProofMutation = useMutation({
    mutationFn: async (formId: number): Promise<ProofRequest> => {
      const response = await fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize proof request');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProofRequestId(data.proofRequestId);
      console.log('Proof request initialized:', data.proofRequestId);
    },
    onError: (error) => {
      console.error('Failed to initialize proof request:', error);
    }
  });

  // Fetch QR code for proof request
  const { data: qrData, isLoading: qrLoading, error: qrError } = useQuery<QRCodeData>({
    queryKey: ['/api/proofs', proofRequestId, 'qr'],
    queryFn: async () => {
      console.log('FormLaunchPage: Fetching QR for proofRequestId:', proofRequestId);
      const response = await fetch(`/api/proofs/${proofRequestId}/qr`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate QR code');
      }
      const data = await response.json();
      console.log('FormLaunchPage: QR data received:', data);
      return data;
    },
    enabled: !!proofRequestId,
  });

  // Poll proof request status
  const { data: statusData } = useQuery({
    queryKey: ['/api/proofs', proofRequestId, 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/proofs/${proofRequestId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch proof status');
      }
      return response.json();
    },
    enabled: !!proofRequestId && !verificationComplete,
    refetchInterval: 4000, // Poll every 4 seconds
    refetchOnWindowFocus: false
  });

  // Auto-initialize proof request when form loads and has VC requirements
  useEffect(() => {
    console.log('FormLaunchPage: Effect triggered', { 
      hasVerifiableCredentials: form?.hasVerifiableCredentials, 
      proofRequestId, 
      isPending: initProofMutation.isPending,
      formId: form?.id
    });
    
    if (form?.hasVerifiableCredentials && !proofRequestId && !initProofMutation.isPending) {
      console.log('FormLaunchPage: Initializing proof request for form', form.id);
      initProofMutation.mutate(form.id);
    }
  }, [form, proofRequestId, initProofMutation]);

  // Handle status changes from polling
  useEffect(() => {
    if (!statusData || verificationComplete) return;

    console.log('Status data received:', statusData);
    
    if (statusData.status === 'presentation_verified') {
      console.log('Proof verification completed with attributes:', statusData.verifiedAttributes);
      setVerifiedAttributes(statusData.verifiedAttributes || {});
      setVerificationComplete(true);
    } else if (statusData.status === 'presentation_declined' || statusData.status === 'error') {
      console.log('Proof verification failed or declined:', statusData.status);
      // Handle error case - could add error state here
    }
  }, [statusData, verificationComplete]);

  // Loading state
  if (formLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading form...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (formError || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The requested form could not be found or is no longer available.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form not published
  if (!form.publishedAt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Form Not Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This form is not yet published and cannot be accessed by users.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProceedToForm = () => {
    // Navigate to the actual form filling page
    navigate(`/form/${form.id}`);
  };

  const handleSkipVerification = () => {
    // Skip verification and go directly to form
    navigate(`/form/${form.id}`, { 
      state: { verifiedAttrs: {} } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Form Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {form.logoUrl && (
                <img 
                  src={form.logoUrl} 
                  alt={`${form.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <CardTitle className="text-2xl">{form.name}</CardTitle>
                {form.purpose && (
                  <p className="text-gray-600 mt-1">{form.purpose}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Credential Verification */}
        {form.hasVerifiableCredentials && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Credential Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Verification Complete */}
              {verificationComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verification Complete ✓
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-green-700 mb-3">
                    Your credentials have been successfully verified. The form has been pre-filled with your verified information.
                  </p>
                  
                  {Object.keys(verifiedAttributes).length > 0 && (
                    <div className="bg-white rounded border p-3 mb-3">
                      <h4 className="font-medium text-sm mb-2">Verified Information:</h4>
                      <ul className="text-sm space-y-1">
                        {Object.entries(verifiedAttributes).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleProceedToForm}
                    className="w-full"
                  >
                    Continue to Form
                  </Button>
                </div>
              )}

              {/* QR Code for Verification */}
              {proofRequestId && !verificationComplete && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verification Ready
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Request ID: {proofRequestId}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      Scan the QR code with your wallet app or use the direct link below:
                    </p>
                    
                    {/* QR Code Display */}
                    <div className="flex justify-center">
                      {qrLoading && (
                        <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin mb-2" />
                            <p className="text-sm text-gray-600">Generating QR...</p>
                          </div>
                        </div>
                      )}
                      
                      {qrError && (
                        <div className="w-48 h-48 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <QrCode className="h-12 w-12 mx-auto text-red-400 mb-2" />
                            <p className="text-sm text-red-600">QR Generation Failed</p>
                            <p className="text-xs text-red-500">
                              {qrError.message || 'Unknown error'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {qrData && (
                        <div className="flex justify-center">
                          <div 
                            className="bg-white border-2 border-gray-300 rounded-lg p-4"
                            dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
                            style={{ width: 'fit-content', height: 'fit-content' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1"
                        disabled={!qrData}
                        asChild={!!qrData}
                      >
                        {qrData ? (
                          <a
                            href={qrData.inviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Wallet
                          </a>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Wallet
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSkipVerification}
                        className="flex-1"
                      >
                        Skip Verification
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Direct Form Access */}
        {!form.hasVerifiableCredentials && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  This form is ready to be filled out.
                </p>
                <Button size="lg" onClick={handleProceedToForm}>
                  Start Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default FormLaunchPage;