/**
 * OCA Bundle Client for fetching and processing OCA bundles
 * Provides simplified interface for BC Government OCA bundle integration
 */

export interface OCABranding {
  primary_background_color?: string;
  secondary_background_color?: string;
  primary_attribute?: string;
  secondary_attribute?: string;
  issued_date_attribute?: string;
  expiry_date_attribute?: string;
  logo?: string;
  background_image?: string;
  background_image_slice?: string;
}

export interface OCAAsset {
  url: string;
  localPath?: string;
  type: 'logo' | 'background' | 'image';
  content?: Buffer;
}

export interface OCABundle {
  capture_base?: {
    attributes?: Record<string, string>;
    type?: string;
    digest?: string;
  };
  overlays?: Array<{
    type: string;
    [key: string]: any;
  }>;
  branding?: OCABranding;
}

/**
 * OCA Bundle Client for fetching OCA bundles from repositories
 */
export class OCABundleClient {
  /**
   * Fetch OCA bundle from URL
   */
  async fetchBundle(url: string): Promise<OCABundle> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch OCA bundle: ${response.status} ${response.statusText}`);
      }
      
      const bundleData = await response.json();
      return this.processBundle(bundleData);
    } catch (error) {
      console.error('Error fetching OCA bundle:', error);
      throw error;
    }
  }

  /**
   * Process raw bundle data into standardized format
   */
  private processBundle(rawBundle: any): OCABundle {
    const bundle: OCABundle = {
      capture_base: rawBundle.capture_base,
      overlays: rawBundle.overlays || [],
    };

    // Extract branding from overlays
    const brandingOverlay = bundle.overlays?.find(overlay => 
      overlay.type === 'oca/branding/1.0'
    );

    if (brandingOverlay) {
      bundle.branding = {
        primary_background_color: brandingOverlay.primary_background_color,
        secondary_background_color: brandingOverlay.secondary_background_color,
        primary_attribute: brandingOverlay.primary_attribute,
        secondary_attribute: brandingOverlay.secondary_attribute,
        issued_date_attribute: brandingOverlay.issued_date_attribute,
        expiry_date_attribute: brandingOverlay.expiry_date_attribute,
        logo: brandingOverlay.logo,
        background_image: brandingOverlay.background_image,
        background_image_slice: brandingOverlay.background_image_slice,
      };
    }

    return bundle;
  }

  /**
   * Fetch asset from URL
   */
  async fetchAsset(url: string): Promise<OCAAsset> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`);
      }
      
      const content = Buffer.from(await response.arrayBuffer());
      const type = this.getAssetType(url);
      
      return {
        url,
        type,
        content,
      };
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  }

  /**
   * Determine asset type from URL
   */
  private getAssetType(url: string): 'logo' | 'background' | 'image' {
    const filename = url.toLowerCase();
    if (filename.includes('logo')) return 'logo';
    if (filename.includes('background') || filename.includes('banner')) return 'background';
    return 'image';
  }
}

// Export singleton instance
export const ocaBundleClient = new OCABundleClient();