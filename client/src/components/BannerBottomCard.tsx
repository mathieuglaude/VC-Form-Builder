import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';
  
  // Debug log to check props
  console.log('BannerBottomCard rendering:', { 
    label, 
    backgroundImage, 
    logoUrl, 
    primaryColor,
    hasBranding: !!credential.branding 
  });

  return (
    <div 
      className="relative rounded-lg shadow-md overflow-hidden bg-white border" 
      style={{ 
        width: '100%', 
        maxWidth: '420px', 
        height: '236px',
        minHeight: '236px' // Ensure minimum height
      }}
    >
      {/* Banner */}
      <img
        src={backgroundImage}
        alt=""
        className="absolute top-0 w-full h-[62%] object-cover"
        onError={(e) => {
          console.error('Failed to load background image:', backgroundImage);
          e.currentTarget.style.display = 'none';
        }}
        onLoad={() => console.log('Background image loaded successfully:', backgroundImage)}
      />
      {/* Teal strip */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="absolute bottom-0 inset-x-0 h-[38%] px-4 py-3"
      >
        {/* Layout container */}
        <div className="flex h-full">
          {/* Left section - logo space */}
          <div className="w-20 flex-shrink-0 relative">
            {/* Issuer name positioned at logo level */}
            <div className="absolute top-2 left-24">
              <p className="text-lg text-white font-medium whitespace-nowrap">Law Society of BC</p>
            </div>
          </div>
        </div>
        
        {/* Credential name positioned below logo */}
        <div className="absolute bottom-3 left-4">
          <h3 className="text-xl text-white font-semibold whitespace-nowrap">Lawyer Credential</h3>
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