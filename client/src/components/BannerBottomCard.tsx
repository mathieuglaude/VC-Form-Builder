import { CredentialTemplate } from "@shared/schema";

interface BannerBottomCardProps {
  credential: CredentialTemplate;
}

export default function BannerBottomCard({ credential }: BannerBottomCardProps) {
  const { label } = credential;
  const { logoUrl, backgroundImage, primaryColor = '#00698c' } = credential.branding || {};
  const issuer = credential.metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)';
  
  return (
    <div 
      className="rounded-lg shadow-md overflow-hidden bg-white border flex-shrink-0" 
      style={{ 
        width: '420px', 
        height: '236px'
      }}
    >
      {/* Top section - Banner Image */}
      <div className="relative h-[146px] bg-gray-100">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load background image:', backgroundImage);
            }}
            onLoad={() => console.log('Background image loaded successfully:', backgroundImage)}
          />
        )}
      </div>
      
      {/* Bottom section - Teal strip with content */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-[90px] px-4 py-3 relative"
      >
        {/* Logo */}
        {logoUrl && (
          <div className="absolute top-2 left-4 w-16 h-16 bg-white rounded shadow flex items-center justify-center">
            <img
              src={logoUrl}
              alt="LSBC Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                console.error('Failed to load logo:', logoUrl);
              }}
            />
          </div>
        )}
        
        {/* Text content */}
        <div className={`pt-1 ${logoUrl ? 'ml-20' : ''}`}>
          <p className="text-lg text-white font-medium">Law Society of BC</p>
          <h3 className="text-xl text-white font-semibold">Lawyer Credential</h3>
        </div>
      </div>
    </div>
  );
}