import { useOCABranding } from "@/hooks/useOCABranding";
import { OCACredentialCard } from "@/components/oca/OCACredentialCard";
import type { CredentialTemplate } from "@shared/schema";

interface CredentialLibraryCardProps {
  credential: CredentialTemplate;
}

export default function CredentialLibraryCard({ credential }: CredentialLibraryCardProps) {
  // Fetch OCA branding for this credential
  const { data: ocaBranding, isLoading } = useOCABranding(credential.id);

  if (isLoading) {
    return (
      <div className="w-96 h-56 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  // If we have OCA branding, use the standardized OCA card
  if (ocaBranding) {
    return (
      <OCACredentialCard
        branding={ocaBranding}
        credentialTitle={credential.label}
        issuerName={credential.brandingMetadata?.issuerName || "Unknown Issuer"}
        size="large"
      />
    );
  }

  // Fallback to basic card using the unified metadata structure
  return (
    <div className="w-96 h-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="h-2/3 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">No OCA branding available</div>
      </div>
      <div 
        className="h-1/3 flex items-center px-4"
        style={{ backgroundColor: credential.brandingMetadata?.colors?.primary || '#4F46E5' }}
      >
        <div className="text-white">
          <div className="font-medium text-sm">{credential.label}</div>
          <div className="text-xs opacity-90">Version {credential.version}</div>
        </div>
      </div>
    </div>
  );
}