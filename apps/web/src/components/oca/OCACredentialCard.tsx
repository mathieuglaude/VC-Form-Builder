import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Standardized OCA credential card renderer
 * Single consistent layout for all credential types
 */

export interface OCABranding {
  capture_base?: string;
  type: string;
  digest?: string;
  logo?: string;
  background_image_slice?: string;
  background_image?: string;
  primary_background_color?: string;
  secondary_background_color?: string;
  primary_attribute?: string;
  secondary_attribute?: string;
  issued_date_attribute?: string;
  expiry_date_attribute?: string;
  processedAt?: Date;
  repositoryId?: string;
  bundlePath?: string;
  assets?: Array<{
    filename: string;
    url: string;
    localPath?: string;
    size?: number;
    contentType?: string;
  }>;
  metadata?: {
    name?: string;
    description?: string;
    issuer?: string;
    version?: string;
    schema_id?: string;
    cred_def_id?: string;
  };
}

export interface OCACredentialCardProps {
  branding?: OCABranding;
  credentialData?: Record<string, any>;
  credentialTitle?: string;
  issuerName?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function OCACredentialCard({ 
  branding, 
  credentialData = {},
  credentialTitle,
  issuerName,
  size = 'medium',
  className 
}: OCACredentialCardProps) {
  if (!branding) {
    return (
      <div className={cn(
        'border border-dashed border-gray-300 rounded-lg p-8 text-center',
        'bg-gray-50 text-gray-500',
        className
      )}>
        <div className="text-sm">No OCA branding available</div>
      </div>
    );
  }

  const cardDimensions = {
    small: 'w-72 h-44',
    medium: 'w-80 h-48', 
    large: 'w-96 h-56'
  };

  // Extract OCA data
  const primaryColor = branding.primary_background_color || '#4F46E5';
  const logoUrl = branding.logo;
  const backgroundImage = branding.background_image;
  
  // Use provided props or extract from branding metadata
  const displayIssuerName = issuerName || branding.metadata?.issuer || 'Digital Issuer';
  const displayCredentialTitle = credentialTitle || branding.metadata?.name || 'Credential';

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg shadow-lg',
      cardDimensions[size],
      className
    )}>
      {/* Top section with background image */}
      <div 
        className="relative h-2/3"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundColor: backgroundImage ? 'transparent' : '#f3f4f6',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Optional overlay text could go here if needed */}
      </div>
      
      {/* Bottom section with primary color, logo, issuer and credential title */}
      <div 
        className="h-1/3 flex items-center px-4 relative"
        style={{ backgroundColor: primaryColor }}
      >
        {/* White logo on the left */}
        {logoUrl && (
          <div className="flex-shrink-0 mr-3">
            <img 
              src={logoUrl} 
              alt="Issuer Logo"
              className="w-10 h-10 object-contain bg-white rounded p-1"
            />
          </div>
        )}
        
        {/* Text content in white */}
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">
            {displayIssuerName}
          </div>
          <div className="text-white text-xs truncate opacity-90">
            {displayCredentialTitle}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OCACredentialCardPreview({ 
  branding, 
  credentialTitle,
  issuerName 
}: { 
  branding?: OCABranding;
  credentialTitle?: string;
  issuerName?: string;
}) {
  if (!branding) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        No OCA branding data to preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        OCA Credential Card Preview
      </div>
      <OCACredentialCard 
        branding={branding}
        credentialTitle={credentialTitle}
        issuerName={issuerName}
      />
    </div>
  );
}