import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of BC';

  return (
    <div className="rounded-lg overflow-hidden shadow-lg w-[340px] aspect-[16/10]">
      {/* Banner (60%) */}
      <div className="relative h-[60%] w-full">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            className="h-full w-full object-cover"
            alt={`${label} banner`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        {logoUrl && (
          <img
            src={logoUrl}
            className="absolute top-4 left-4 h-12 w-12 rounded-lg bg-white shadow object-contain p-1"
            alt="issuer logo"
          />
        )}
      </div>
      
      {/* Teal strip (40%) */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-[40%] p-4 flex flex-col justify-center space-y-1"
      >
        <p className="text-xs text-gray-200 font-medium">{issuer}</p>
        <h3 className="text-lg text-white font-semibold leading-tight">{label}</h3>
      </div>
    </div>
  );
}