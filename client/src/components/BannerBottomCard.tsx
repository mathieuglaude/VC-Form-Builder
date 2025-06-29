import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

const CARD_W   = 420;   // 420 × 236 ≈ 16:9
const BANNER_H = 236 * 0.62; // ~146 px banner (62%)

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';

  return (
    <div
      className="relative rounded-lg shadow-md overflow-hidden"
      style={{ width: CARD_W, height: 236 }}   // 🔒 FIXES CROPPING
    >
      {/* Banner */}
      <img
        src={backgroundImage}
        alt=""
        style={{ height: BANNER_H }}
        className="absolute top-0 w-full h-[146px] object-cover"
      />
      {/* Teal strip */}
      <div
        style={{ top: BANNER_H, backgroundColor: primaryColor }}
        className="absolute inset-x-0 h-[90px] px-4 py-3 flex items-start"
      >
        {/* Space for logo */}
        <div className="w-20 flex-shrink-0"></div>
        
        {/* Text content positioned to the right of logo */}
        <div className="ml-4 flex flex-col justify-center h-full">
          <p className="text-sm text-white font-medium">Law Society of BC</p>
          <h3 className="text-xl text-white font-semibold">Lawyer Credential</h3>
        </div>
      </div>
      {/* Logo positioned at banner/teal boundary */}
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          className="absolute left-6 top-[calc(146px-36px)] w-20 h-20 rounded-xl bg-white shadow"
        />
      )}
    </div>
  );
}