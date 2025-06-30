import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VCModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: number;
  onVerificationSuccess: (attributes: Record<string, any>) => void;
}

export default function VCModal({ isOpen, onClose, formId, onVerificationSuccess }: VCModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [proofRequest, setProofRequest] = useState<any>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  // Establish WebSocket connection
  useEffect(() => {
    if (isOpen) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'proof_verified' && message.txId === proofRequest?.txId) {
          setIsLoading(false);
          onVerificationSuccess(message.attributes);
          onClose();
          toast({
            title: "Verification Successful",
            description: "Your credentials have been verified and form fields have been auto-populated.",
          });
        }
      };
      
      setSocket(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [isOpen, proofRequest?.txId, onVerificationSuccess, onClose, toast]);

  const requestProof = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId })
      });

      if (!response.ok) {
        throw new Error('Failed to create proof request');
      }

      const data = await response.json();
      setProofRequest(data);

    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to create proof request. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestProof();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsLoading(false);
    setProofRequest(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Verify Your Credentials
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          {!proofRequest ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Preparing verification request...</p>
            </div>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="w-48 h-48 mx-auto mb-4 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                {proofRequest.qr ? (
                  <img 
                    src={proofRequest.qr} 
                    alt="Verification QR Code"
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">QR Code Loading...</p>
                  </div>
                )}
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 mb-2">Scan with your wallet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Use your mobile wallet app to scan the QR code and present your credentials.
              </p>

              {/* Mobile Deep Link */}
              {proofRequest.deepLink && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(proofRequest.deepLink, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Open in Wallet App
                  </Button>
                </div>
              )}
              
              {/* Status Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-700">
                  {isLoading ? "Waiting for credential presentation..." : "Ready to scan"}
                </span>
              </div>
              
              {/* Alternative Options */}
              <div className="border-t border-gray-200 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => window.open(proofRequest.deepLink, '_blank')}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Open in Wallet App
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
