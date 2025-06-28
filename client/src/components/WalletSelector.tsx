import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, AlertTriangle } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
  provider: string;
  platforms: string[];
  supported: boolean;
}

interface WalletSelectorProps {
  credentialRequirements: Array<{
    credentialType: string;
    compatibleWallets: string[];
    walletRestricted: boolean;
  }>;
  selectedWallets: string[];
  onWalletChange: (wallets: string[]) => void;
}

const availableWallets: WalletOption[] = [
  {
    id: "bc-wallet",
    name: "BC Wallet",
    provider: "Government of British Columbia",
    platforms: ["iOS", "Android"],
    supported: true
  },
  {
    id: "nb-orbit-edge",
    name: "NB Orbit Edge Wallet",
    provider: "Northern Block",
    platforms: ["iOS", "Android"],
    supported: true
  }
];

export default function WalletSelector({ credentialRequirements, selectedWallets, onWalletChange }: WalletSelectorProps) {
  const [compatibleWallets, setCompatibleWallets] = useState<WalletOption[]>([]);
  const [hasRestrictions, setHasRestrictions] = useState(false);

  useEffect(() => {
    if (credentialRequirements.length === 0) {
      setCompatibleWallets(availableWallets);
      setHasRestrictions(false);
      return;
    }

    // Find wallets that support ALL required credentials
    const restrictedCredentials = credentialRequirements.filter(req => req.walletRestricted);
    const hasRestrictedCreds = restrictedCredentials.length > 0;
    setHasRestrictions(hasRestrictedCreds);

    if (hasRestrictedCreds) {
      // For restricted credentials, only show wallets that support ALL of them
      const supportedWalletNames = restrictedCredentials.reduce((intersection, req) => {
        if (intersection.length === 0) return req.compatibleWallets;
        return intersection.filter(wallet => req.compatibleWallets.includes(wallet));
      }, [] as string[]);

      const compatible = availableWallets.filter(wallet => 
        supportedWalletNames.includes(wallet.name)
      );
      setCompatibleWallets(compatible);

      // Auto-select if only one option
      if (compatible.length === 1 && selectedWallets.length === 0) {
        onWalletChange([compatible[0].id]);
      }
    } else {
      // For non-restricted credentials, show all wallets
      setCompatibleWallets(availableWallets);
    }
  }, [credentialRequirements, selectedWallets.length, onWalletChange]);

  const handleWalletToggle = (walletId: string, checked: boolean) => {
    if (checked) {
      onWalletChange([...selectedWallets, walletId]);
    } else {
      onWalletChange(selectedWallets.filter(id => id !== walletId));
    }
  };

  if (credentialRequirements.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Compatible Wallets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasRestrictions && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This form requires government-issued credentials that are only available in specific wallets.
              Users must have one of the compatible wallets to complete verification.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Select which wallets you want to recommend to users for completing this form:
          </p>

          {compatibleWallets.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No compatible wallets found for the selected credentials.</p>
              <p className="text-sm mt-1">Please review your credential requirements.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {compatibleWallets.map(wallet => (
                <div key={wallet.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={wallet.id}
                    checked={selectedWallets.includes(wallet.id)}
                    onCheckedChange={(checked) => handleWalletToggle(wallet.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor={wallet.id} className="cursor-pointer">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-600">{wallet.provider}</div>
                      <div className="flex gap-1 mt-1">
                        {wallet.platforms.map(platform => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedWallets.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected wallets:</strong> Users will be shown instructions for{" "}
                {compatibleWallets
                  .filter(w => selectedWallets.includes(w.id))
                  .map(w => w.name)
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}