import React from 'react';
import { cn } from '@/lib/utils';

/**
 * OCA-compliant credential card renderer
 * Follows BC Government OCA for Aries standards
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
  variant?: 'banner-bottom' | 'banner-top' | 'full-background' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function OCACredentialCard({ 
  branding, 
  credentialData = {}, 
  variant = 'banner-bottom',
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

  const primaryColor = branding.primary_background_color || '#4F46E5';
  const secondaryColor = branding.secondary_background_color || '#6B7280';
  const logoUrl = branding.logo;
  const backgroundImage = branding.background_image;

  // Extract credential data based on OCA attributes
  const primaryText = branding.primary_attribute ? 
    credentialData[branding.primary_attribute] || 'Primary Attribute' : 
    credentialData.given_names || credentialData.name || 'John Doe';
    
  const secondaryText = branding.secondary_attribute ? 
    credentialData[branding.secondary_attribute] || 'Secondary Attribute' :
    credentialData.member_status || credentialData.title || 'Professional';

  const issuerName = branding.metadata?.issuer || 'Digital Issuer';

  if (variant === 'banner-bottom') {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-lg shadow-lg',
        cardDimensions[size],
        className
      )}>
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: primaryColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Content Area */}
        <div className="relative h-full flex flex-col">
          {/* Main content area */}
          <div className="flex-1 p-4 text-white">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo"
                className="w-16 h-16 object-contain mb-3 bg-white rounded p-1"
              />
            )}
            <div className="space-y-1">
              <div className="text-lg font-semibold">{primaryText}</div>
              <div className="text-sm opacity-90">{secondaryText}</div>
            </div>
          </div>
          
          {/* Bottom banner */}
          <div 
            className="h-12 flex items-center px-4"
            style={{ backgroundColor: secondaryColor }}
          >
            <div className="text-white text-sm font-medium">{issuerName}</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner-top') {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-lg shadow-lg',
        cardDimensions[size],
        className
      )}>
        {/* Top banner */}
        <div 
          className="h-12 flex items-center px-4"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="text-white text-sm font-medium">{issuerName}</div>
        </div>
        
        {/* Main content */}
        <div 
          className="flex-1 p-4"
          style={{
            backgroundColor: secondaryColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo"
              className="w-16 h-16 object-contain mb-3 bg-white rounded p-1"
            />
          )}
          <div className="space-y-1 text-white">
            <div className="text-lg font-semibold">{primaryText}</div>
            <div className="text-sm opacity-90">{secondaryText}</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'full-background') {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-lg shadow-lg',
        cardDimensions[size],
        className
      )}>
        {/* Full background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: primaryColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Content */}
        <div className="relative h-full p-4 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo"
                className="w-12 h-12 object-contain bg-white rounded p-1"
              />
            )}
            <div className="text-xs opacity-75">{issuerName}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-semibold">{primaryText}</div>
            <div className="text-sm opacity-90">{secondaryText}</div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={cn(
      'border rounded-lg p-4 bg-white shadow',
      cardDimensions[size],
      className
    )}>
      <div className="flex items-center space-x-3 h-full">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <div 
            className="text-lg font-semibold truncate"
            style={{ color: primaryColor }}
          >
            {primaryText}
          </div>
          <div className="text-sm text-gray-600 truncate">{secondaryText}</div>
          <div className="text-xs text-gray-400 truncate">{issuerName}</div>
        </div>
      </div>
    </div>
  );
}

export function OCACredentialCardPreview({ branding }: { branding?: OCABranding }) {
  const sampleData = {
    given_names: 'John',
    surname: 'Doe',
    member_status: 'Active Professional',
    credential_type: 'Lawyer'
  };

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
        credentialData={sampleData}
        variant="banner-bottom"
      />
    </div>
  );
}