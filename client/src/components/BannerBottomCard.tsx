import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

const BANNER_H = 180; // px

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';

  return (
    <div className="rounded-lg shadow-md overflow-hidden w-[380px]">
      <div className={`relative h-[${BANNER_H}px]`}>
        <img 
          src={backgroundImage} 
          className="w-full h-full object-cover" 
          alt={`${label} banner`}
        />
        {logoUrl && (
          <img 
            src={logoUrl} 
            className="absolute top-6 left-6 w-16 h-16 rounded-lg bg-white shadow-lg object-contain p-1" 
            alt="issuer logo"
          />
        )}
      </div>
      <div style={{ backgroundColor: primaryColor }} className="p-4 space-y-1">
        <p className="text-xs text-gray-200 font-medium">{issuer}</p>
        <h3 className="text-xl text-white font-semibold">Lawyer Credential</h3>
      </div>
    </div>
  );
}