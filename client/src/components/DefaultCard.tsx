import { CredentialTemplate } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface DefaultCardProps {
  credential: CredentialTemplate;
}

export default function DefaultCard({ credential }: DefaultCardProps) {
  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">{credential.label}</h3>
            <p className="text-sm text-gray-500">Version {credential.version}</p>
          </div>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Issuer</p>
            <p className="text-sm text-gray-600">
              {credential.metaOverlay?.issuer || credential.issuerDid}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {credential.ecosystem && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {credential.ecosystem}
              </Badge>
            )}
            {credential.interopProfile && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {credential.interopProfile}
              </Badge>
            )}
            {credential.isPredefined && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                BC Government
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
}