import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

const CARD_W   = 420;  // px — same everywhere
const BANNER_H = 170;  // px
const LOGO_SZ  = 56;   // square
const LOGO_INSET = 20; // px from top-left

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';

  return (
    <div className="rounded-lg shadow-md overflow-hidden" style={{ width: CARD_W }}>
      {/* banner */}
      <div style={{ height: BANNER_H }} className="relative">
        <img src={backgroundImage} className="w-full h-full object-cover" alt={`${label} banner`} />
        {logoUrl && (
          <img
            src={logoUrl}
            className="absolute"
            style={{
              top: LOGO_INSET,
              left: LOGO_INSET,
              width: LOGO_SZ,
              height: LOGO_SZ,
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 1px 3px rgb(0 0 0 / .2)'
            }}
            alt="issuer logo"
          />
        )}
      </div>
      {/* teal strip */}
      <div className="p-4 space-y-1" style={{ backgroundColor: primaryColor }}>
        <p className="text-xs text-gray-200 font-medium">{issuer}</p>
        <h3 className="text-lg text-white font-semibold">Lawyer Credential</h3>
      </div>
    </div>
  );
}