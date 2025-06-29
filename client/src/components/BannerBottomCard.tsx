import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';

  return (
    <div className="rounded-lg overflow-hidden shadow-md w-[340px]">
      {/* Banner (60%) */}
      <div className="h-[140px] w-full relative">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt={`${label} banner`}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #4a90a4 0%, #2c5f70 100%)';
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br" style={{ background: 'linear-gradient(135deg, #4a90a4 0%, #2c5f70 100%)' }} />
        )}
        {logoUrl && (
          <img
            src={logoUrl}
            alt="issuer logo"
            className="absolute top-4 left-4 h-12 w-12 rounded-lg bg-white shadow-sm object-contain p-1"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>
      
      {/* Teal strip (40%) */}
      <div style={{ backgroundColor: primaryColor }} className="px-4 py-3 space-y-1">
        <p className="text-xs text-gray-200 font-medium truncate">{issuer}</p>
        <h3 className="text-lg text-white font-semibold">{label}</h3>
      </div>
    </div>
  );
}