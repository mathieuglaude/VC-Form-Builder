import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Smartphone, Globe, ExternalLink } from "lucide-react";

interface Wallet {
  id: number;
  name: string;
  provider: string;
  platforms: string[];
  supportedProtocols: string[];
  features: string[];
  downloadLinks: {
    ios?: string;
    android?: string;
    web?: string;
  };
  description: string;
  logo?: string;
}

const wallets: Wallet[] = [
  {
    id: 1,
    name: "BC Wallet",
    provider: "Government of British Columbia",
    platforms: ["iOS", "Android"],
    supportedProtocols: ["AIP 2.0", "Aries", "DIDComm"],
    features: ["Credential Storage", "Proof Presentation", "Government Services", "Secure Messaging"],
    downloadLinks: {
      ios: "https://apps.apple.com/ca/app/bc-wallet/id1234567890",
      android: "https://play.google.com/store/apps/details?id=ca.bc.gov.wallet"
    },
    description: "Official digital wallet from the Government of British Columbia for storing and presenting verified credentials."
  },
  {
    id: 2,
    name: "NB Orbit Edge Wallet",
    provider: "Northern Block",
    platforms: ["iOS", "Android"],
    supportedProtocols: ["AIP 2.0", "Aries", "DIDComm"],
    features: ["Enterprise Ready", "AIP 2.0 Compatible", "Secure Storage", "Multi-Platform"],
    downloadLinks: {
      ios: "https://apps.apple.com/ca/app/nb-orbit-edge/id1234567894",
      android: "https://play.google.com/store/apps/details?id=com.northernblock.orbit"
    },
    description: "Digital wallet from Northern Block supporting AIP 2.0 protocols for enterprise and government credential verification."
  }
];

export default function WalletLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("");

  const platforms = Array.from(new Set(wallets.flatMap(wallet => wallet.platforms)));
  const protocols = Array.from(new Set(wallets.flatMap(wallet => wallet.supportedProtocols)));

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = !selectedPlatform || wallet.platforms.includes(selectedPlatform);
    const matchesProtocol = !selectedProtocol || wallet.supportedProtocols.includes(selectedProtocol);

    return matchesSearch && matchesPlatform && matchesProtocol;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Library</h1>
          <p className="text-gray-600">
            Discover digital wallets that support verifiable credentials and can work with your forms.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search wallets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="">All Protocols</option>
              {protocols.map(protocol => (
                <option key={protocol} value={protocol}>{protocol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Wallet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map(wallet => (
            <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{wallet.name}</CardTitle>
                    <p className="text-sm text-gray-600">{wallet.provider}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-1 mb-2">
                      {wallet.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 text-sm mb-4">{wallet.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Supported Protocols</h4>
                    <div className="flex flex-wrap gap-1">
                      {wallet.supportedProtocols.map(protocol => (
                        <Badge key={protocol} variant="outline" className="text-xs">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {wallet.features.slice(0, 3).map(feature => (
                        <Badge key={feature} className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {feature}
                        </Badge>
                      ))}
                      {wallet.features.length > 3 && (
                        <Badge className="text-xs bg-gray-100 text-gray-600">
                          +{wallet.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="font-medium text-sm mb-2">Download</h4>
                    <div className="flex gap-2">
                      {wallet.downloadLinks.ios && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={wallet.downloadLinks.ios} target="_blank" rel="noopener noreferrer">
                            <Smartphone className="h-3 w-3 mr-1" />
                            iOS
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {wallet.downloadLinks.android && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={wallet.downloadLinks.android} target="_blank" rel="noopener noreferrer">
                            <Smartphone className="h-3 w-3 mr-1" />
                            Android
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {wallet.downloadLinks.web && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={wallet.downloadLinks.web} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3 w-3 mr-1" />
                            Web
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWallets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No wallets found</p>
              <p className="text-sm">
                Try adjusting your filters to see more results
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}