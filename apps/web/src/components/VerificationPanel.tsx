import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, X } from 'lucide-react';

interface VerificationPanelProps {
  svg: string;
  url: string;
  onCancel?: () => void;
}

export default function VerificationPanel({ svg, url, onCancel }: VerificationPanelProps) {
  console.log('[panel] mounted with props', { svg: !!svg, url });
  const [isVisible, setIsVisible] = useState(true);

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
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Scan with your digital wallet to verify credentials
          </p>
          
          {/* QR Code Display */}
          <div className="flex justify-center mb-4">
            <div className="w-64 h-64 bg-white rounded-lg border shadow-sm p-2 flex items-center justify-center">
              <div dangerouslySetInnerHTML={{__html: svg}} />
            </div>
          </div>

          {/* Direct wallet link */}
          <Button asChild variant="outline" className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Wallet
            </a>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="w-full text-sm text-gray-500"
        >
          Cancel Verification
        </Button>
      </CardContent>
    </Card>
  );
}