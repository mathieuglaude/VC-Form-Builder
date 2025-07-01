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
    staleTime: 5 * 60 * 1000, // 5 minutes to match backend cache TTL
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

  // Listen for proof request status via Server-Sent Events
  useEffect(() => {
    if (!proofRequestId || verificationComplete) return;

    console.log(`Setting up SSE for proof request: ${proofRequestId}`);
    const eventSource = new EventSource(`/api/proofs/${proofRequestId}/stream`);

    eventSource.addEventListener('done', (event) => {
      try {
        const attributes = JSON.parse(event.data);
        console.log('Proof verification completed with attributes:', attributes);
        setVerifiedAttributes(attributes);
        setVerificationComplete(true);
        eventSource.close();
      } catch (error) {
        console.error('Failed to parse verified attributes:', error);
      }
    });

    eventSource.addEventListener('status', (event) => {
      try {
        const { status } = JSON.parse(event.data);
        console.log(`Proof request status: ${status}`);
      } catch (error) {
        console.error('Failed to parse status update:', error);
      }
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE error:', event);
      eventSource.close();
    });

    return () => {
      console.log(`Cleaning up SSE for proof request: ${proofRequestId}`);
      eventSource.close();
    };
  }, [proofRequestId, verificationComplete]);

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
            <CardTitle className="text-red-600">Form Not Found</CardTitle>
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

        {/* Credential Verification Section */}
        {form.hasVerifiableCredentials && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Credential Verification Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  This form requires verification of your digital credentials to auto-populate certain fields.
                </p>

                {initProofMutation.isPending && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing verification...</span>
                  </div>
                )}

                {initProofMutation.error && (
                  <Alert>
                    <AlertDescription>
                      Failed to initialize credential verification: {initProofMutation.error.message}
                    </AlertDescription>
                  </Alert>
                )}

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
                          <div 
                            className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
                          />
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

                {verificationComplete && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✅ Credentials Verified
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-green-700 mb-3">
                      Your digital credentials have been successfully verified.
                      {Object.keys(verifiedAttributes).length > 0 && (
                        <span className="block mt-1 text-xs">
                          Verified attributes: {Object.keys(verifiedAttributes).join(', ')}
                        </span>
                      )}
                    </p>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => navigate(`/form/${form.id}`, { 
                        state: { verifiedAttrs: verifiedAttributes } 
                      })}
                    >
                      Continue to Form
                    </Button>
                  </div>
                )}
              </div>
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