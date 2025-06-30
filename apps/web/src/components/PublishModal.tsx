import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wifi, QrCode } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (transport: 'connection' | 'oob') => void;
  isPublishing?: boolean;
}

export default function PublishModal({ isOpen, onClose, onPublish, isPublishing = false }: PublishModalProps) {
  const [transport, setTransport] = useState<'oob' | 'connection'>('oob');

  const handlePublish = () => {
    onPublish(transport);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-4">Publish Form</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-600 mb-6">
            Choose how users will interact with credentials when filling out your form:
          </p>
          
          <RadioGroup value={transport} onValueChange={(value) => setTransport(value as 'oob' | 'connection')}>
            <div className="space-y-4">
              {/* Out of Band Option */}
              <Card className={`cursor-pointer transition-colors ${transport === 'oob' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="oob" id="oob" />
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">Out of Band (QR only)</CardTitle>
                      <CardDescription className="text-sm">
                        Single QR code for immediate credential verification
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-8">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Best for:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Quick verification workflows</li>
                      <li>One-time form submissions</li>
                      <li>Simple credential verification</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Connection-based Option */}
              <Card className={`cursor-pointer transition-colors ${transport === 'connection' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="connection" id="connection" />
                    <Wifi className="w-5 h-5 text-green-600" />
                    <div>
                      <CardTitle className="text-base">Connection-based (wallet pair then proof)</CardTitle>
                      <CardDescription className="text-sm">
                        Establish wallet connection for verification and optional credential issuance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-8">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Best for:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Multi-step verification processes</li>
                      <li>Forms that issue credentials back</li>
                      <li>Ongoing wallet relationships</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isPublishing}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Form'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}