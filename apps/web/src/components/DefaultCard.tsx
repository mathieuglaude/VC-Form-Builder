import { CredentialTemplate } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface DefaultCardProps {
  credential: CredentialTemplate;
}

export default function DefaultCard({ credential }: DefaultCardProps) {
  return (
    <div 
      className="relative rounded-lg shadow-md overflow-hidden bg-white border" 
      style={{ width: '100%', maxWidth: '420px', height: '236px' }}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 text-lg">{credential.label}</h3>
            <p className="text-sm text-gray-500">Version {credential.version}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Issuer</p>
          <p className="text-sm text-gray-600 truncate">
            {credential.metaOverlay?.issuer || credential.issuerDid}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {credential.ecosystem && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              {credential.ecosystem}
            </Badge>
          )}
          {credential.interopProfile && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
              {credential.interopProfile}
            </Badge>
          )}
          {credential.isPredefined && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
              BC Government
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}