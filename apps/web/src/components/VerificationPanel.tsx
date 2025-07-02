import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, X } from 'lucide-react';

interface VerificationPanelProps {
  svg: string;
  url: string;
  className?: string;
  onCancel?: () => void;
}

export default function VerificationPanel({ svg, url, className = '', onCancel }: VerificationPanelProps) {
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
    <aside className={`rounded-lg border bg-background p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-center font-medium text-lg flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Credential Verification
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Scan with your digital wallet to verify credentials
        </p>
        
        {/* QR Code Display */}
        <div 
          className="mx-auto mb-4 w-[232px] h-[232px] bg-white rounded-lg border shadow-sm p-2 flex items-center justify-center"
          dangerouslySetInnerHTML={{__html: svg}} 
        />

        {/* Direct wallet link */}
        <Button asChild variant="outline" className="w-full mb-4">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Wallet
          </a>
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="w-full text-sm text-gray-500"
        >
          Cancel Verification
        </Button>
        
        {/* Debug information */}
        <details className="mt-4 text-left">
          <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono break-all">
            <div className="mb-1"><strong>URL:</strong> {url}</div>
            <div><strong>Protocol:</strong> {url.startsWith('didcomm://') ? 'DIDComm' : url.startsWith('https://') ? 'HTTPS' : 'Unknown'}</div>
          </div>
        </details>
      </div>
    </aside>
  );
}