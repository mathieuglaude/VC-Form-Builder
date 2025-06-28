import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Smartphone } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";

interface VCModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: number;
  clientId: string;
  onVerificationSuccess: (attributes: Record<string, any>) => void;
}

export default function VCModal({ isOpen, onClose, formId, clientId, onVerificationSuccess }: VCModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [proofRequest, setProofRequest] = useState<any>(null);
  const { toast } = useToast();

  const { isConnected } = useSocket({
    clientId,
    onMessage: (message) => {
      if (message.type === 'proof_verified' && message.formId === formId) {
        setIsLoading(false);
        onVerificationSuccess(message.attributes);
        onClose();
        toast({
          title: "Verification Successful",
          description: "Your credentials have been verified and form fields have been auto-populated.",
        });
      }
    }
  });

  const requestProof = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proofs/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, clientId })
      });

      if (!response.ok) {
        throw new Error('Failed to create proof request');
      }

      const data = await response.json();
      setProofRequest(data);

      // For demo purposes, also trigger simulation
      setTimeout(() => {
        fetch('/api/proofs/simulate-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId, clientId })
        });
      }, 1000);

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
    if (isOpen && isConnected) {
      requestProof();
    }
  }, [isOpen, isConnected]);

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
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 mb-2">Scan with your wallet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Use your mobile wallet app to scan the QR code and present your employment credentials.
              </p>
              
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
