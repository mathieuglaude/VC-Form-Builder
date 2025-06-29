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
        className="absolute inset-x-0 h-[90px] px-4 py-3 flex items-center"
      >
        {/* Logo positioned in teal strip */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="w-14 h-14 rounded-xl bg-white shadow mr-4 flex-shrink-0"
          />
        )}
        {/* Text content */}
        <div>
          <p className="text-xs text-gray-200 font-medium">Law Society of BC</p>
          <h3 className="text-lg text-white font-semibold">Lawyer Credential</h3>
        </div>
      </div>
    </div>
  );
}