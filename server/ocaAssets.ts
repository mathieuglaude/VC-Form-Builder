import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ASSET_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public/oca-assets/lsbc'
);
fs.mkdirSync(ASSET_DIR, { recursive: true });

interface OCAOverlay {
  type: string;
  [key: string]: any;
}

interface OCABundle {
  overlays: OCAOverlay[];
}

export async function cacheAsset(url: string, localName: string): Promise<string> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const localPath = path.join(ASSET_DIR, localName);
    fs.writeFileSync(localPath, buffer);
    
    return `/oca-assets/lsbc/${localName}`;
  } catch (error) {
    console.error(`Failed to cache asset ${url}:`, error);
    return url; // Fallback to original URL
  }
}

export async function fetchOCABundle(bundleUrl: string): Promise<{
  branding: {
    logoUrl?: string;
    backgroundImage?: string;
    primaryColor?: string;
    layout?: string;
  };
  metaOverlay: {
    issuer?: string;
    issuerUrl?: string;
    description?: string;
  };
}> {
  try {
    console.log('Fetching OCA bundle from:', bundleUrl);
    
    // Fetch the main bundle file
    const response = await fetch(bundleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OCA bundle: ${response.statusText}`);
    }
    
    const bundle: OCABundle = await response.json();
    
    // Extract branding overlay
    const brandingOverlay = bundle.overlays.find(o => 
      o.type === 'aries/overlays/branding/1.0'
    );
    
    // Extract meta overlay
    const metaOverlay = bundle.overlays.find(o => 
      o.type === 'spec/overlays/meta/1.0'
    );
    
    // Extract card overlay for layout
    const cardOverlay = bundle.overlays.find(o => 
      o.type === 'spec/overlays/card/1.0'
    );
    
    const result = {
      branding: {
        layout: cardOverlay?.layout || 'default' as string,
        logoUrl: undefined as string | undefined,
        backgroundImage: undefined as string | undefined,
        primaryColor: undefined as string | undefined,
      },
      metaOverlay: {},
    };
    
    // Process branding assets
    if (brandingOverlay) {
      if (brandingOverlay.logo) {
        result.branding.logoUrl = await cacheAsset(brandingOverlay.logo, 'lsbc_logo.png');
      }
      if (brandingOverlay.background_image) {
        result.branding.backgroundImage = await cacheAsset(brandingOverlay.background_image, 'lsbc_banner.jpg');
      }
      if (brandingOverlay.primary_background_color) {
        result.branding.primaryColor = brandingOverlay.primary_background_color;
      }
    }
    
    // Process meta overlay
    if (metaOverlay) {
      result.metaOverlay = {
        issuer: metaOverlay.issuer,
        issuerUrl: metaOverlay.issuer_url,
        description: metaOverlay.description,
      };
    }
    
    console.log('OCA bundle processed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Failed to fetch OCA bundle:', error);
    
    // Return fallback values
    return {
      branding: {
        primaryColor: '#00698c',
        layout: 'default',
      },
      metaOverlay: {
        issuer: 'Law Society of British Columbia (LSBC)',
        issuerUrl: 'https://www.lawsociety.bc.ca/',
        description: 'This credential represents proof that a Lawyer in British Columbia is in good standing with the Law Society of British Columbia',
      },
    };
  }
}