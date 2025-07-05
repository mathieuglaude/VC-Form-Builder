/**
 * Unified OCA Processing Core
 * Standardizes OCA bundle fetching and branding extraction across the application
 */

export interface StandardizedOCABranding {
  logo?: string;
  backgroundImage?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  layout: string;
  metadata?: {
    name?: string;
    issuer?: string;
    version?: string;
    processedAt?: string;
    repositoryId?: string;
    bundlePath?: string;
  };
}

export interface OCABundleResponse {
  capture_base?: {
    attributes?: Record<string, string>;
    type?: string;
    digest?: string;
  };
  overlays?: Array<{
    type: string;
    [key: string]: any;
  }>;
}

export class UnifiedOCAProcessor {
  /**
   * Convert GitHub tree URL to raw content URLs for OCA bundle files
   */
  static convertGitHubTreeToRawUrls(githubTreeUrl: string): { bundleUrl: string; baseUrl: string } {
    // Convert GitHub tree URL to raw content URL
    // From: https://github.com/bcgov/aries-oca-bundles/tree/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test
    // To: https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test
    
    const treeMatch = githubTreeUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)/);
    
    if (!treeMatch) {
      throw new Error(`Invalid GitHub tree URL format: ${githubTreeUrl}`);
    }

    const [, owner, repo, branch, path] = treeMatch;
    const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const bundleUrl = `${baseUrl}/OCABundle.json`;

    return { bundleUrl, baseUrl };
  }

  /**
   * Fetch OCA bundle from GitHub repository URL
   */
  static async fetchOCABundleFromGitHub(githubTreeUrl: string): Promise<StandardizedOCABranding> {
    try {
      console.log(`[UnifiedOCA] Fetching OCA bundle from: ${githubTreeUrl}`);
      
      const { bundleUrl, baseUrl } = this.convertGitHubTreeToRawUrls(githubTreeUrl);
      
      console.log(`[UnifiedOCA] Converted to bundle URL: ${bundleUrl}`);
      
      // Try to fetch the OCA bundle JSON
      let bundleData: OCABundleResponse | null = null;
      
      // Try primary bundle URL
      try {
        const response = await fetch(bundleUrl);
        if (response.ok) {
          bundleData = await response.json();
          console.log(`[UnifiedOCA] Found bundle at: ${bundleUrl}`);
        }
      } catch (error) {
        console.log(`[UnifiedOCA] Primary bundle URL failed: ${bundleUrl}`);
      }
      
      // Try alternative bundle file names if primary failed
      if (!bundleData) {
        const alternativeUrls = [
          `${baseUrl}/bundle.json`,
          `${baseUrl}/oca-bundle.json`,
          `${baseUrl}/overlay.json`
        ];
        
        for (const altUrl of alternativeUrls) {
          try {
            const altResponse = await fetch(altUrl);
            if (altResponse.ok) {
              bundleData = await altResponse.json();
              console.log(`[UnifiedOCA] Found bundle at: ${altUrl}`);
              break;
            }
          } catch (error) {
            // Continue to next alternative
          }
        }
      }
      
      if (!bundleData) {
        console.log(`[UnifiedOCA] No OCA bundle found, using defaults for: ${githubTreeUrl}`);
        return this.getDefaultBranding();
      }
      
      return this.processOCABundle(bundleData, baseUrl, githubTreeUrl);
      
    } catch (error) {
      console.error(`[UnifiedOCA] Error fetching bundle from ${githubTreeUrl}:`, error);
      return this.getDefaultBranding();
    }
  }

  /**
   * Process OCA bundle JSON and extract standardized branding
   */
  static async processOCABundle(
    bundleData: OCABundleResponse, 
    baseUrl: string, 
    originalUrl: string
  ): Promise<StandardizedOCABranding> {
    try {
      // Look for branding overlay in the bundle
      const overlays = bundleData.overlays || [];
      const brandingOverlay = overlays.find((overlay: any) => 
        overlay.type === 'oca/branding/1.0' || 
        overlay.type?.includes('branding') ||
        overlay.type === 'aries/overlays/branding/1.0'
      );

      const result: StandardizedOCABranding = {
        colors: {
          primary: '#00698c', // Default LSBC teal
          secondary: '#1a2930' // Default LSBC dark grey
        },
        layout: 'banner-bottom', // Default for LSBC
        metadata: {
          processedAt: new Date().toISOString(),
          repositoryId: this.extractRepositoryId(originalUrl),
          bundlePath: this.extractBundlePath(originalUrl)
        }
      };

      if (brandingOverlay) {
        console.log(`[UnifiedOCA] Found branding overlay:`, brandingOverlay);
        
        // Extract colors with fallbacks
        if (brandingOverlay.primary_background_color || brandingOverlay.primary_colour) {
          result.colors.primary = brandingOverlay.primary_background_color || brandingOverlay.primary_colour || '#00698c';
        }
        
        if (brandingOverlay.secondary_background_color || brandingOverlay.secondary_colour) {
          result.colors.secondary = brandingOverlay.secondary_background_color || brandingOverlay.secondary_colour || '#1a2930';
        }

        // Extract logo
        if (brandingOverlay.logo) {
          result.logo = brandingOverlay.logo.startsWith('http') 
            ? brandingOverlay.logo 
            : `${baseUrl}/${brandingOverlay.logo}`;
        }

        // Extract background image
        if (brandingOverlay.background_image) {
          result.backgroundImage = brandingOverlay.background_image.startsWith('http')
            ? brandingOverlay.background_image
            : `${baseUrl}/${brandingOverlay.background_image}`;
        }

        // Extract layout information
        if (brandingOverlay.layout || brandingOverlay.card_layout) {
          result.layout = brandingOverlay.layout || brandingOverlay.card_layout || 'banner-bottom';
        }
      }

      // Try to find logo in common locations if not in overlay
      if (!result.logo) {
        const logoUrls = [
          `${baseUrl}/logo.png`,
          `${baseUrl}/logo.svg`,
          `${baseUrl}/assets/logo.png`,
          `${baseUrl}/assets/logo.svg`
        ];
        
        for (const logoUrl of logoUrls) {
          try {
            const logoResponse = await fetch(logoUrl, { method: 'HEAD' });
            if (logoResponse.ok) {
              result.logo = logoUrl;
              console.log(`[UnifiedOCA] Found logo at: ${logoUrl}`);
              break;
            }
          } catch (error) {
            // Continue to next URL
          }
        }
      }

      console.log(`[UnifiedOCA] Processed bundle result:`, result);
      return result;

    } catch (error) {
      console.error(`[UnifiedOCA] Error processing bundle:`, error);
      return this.getDefaultBranding();
    }
  }

  /**
   * Fetch multiple OCA bundles and return the first successful result
   */
  static async fetchMultipleBundles(githubUrls: string[]): Promise<StandardizedOCABranding> {
    if (githubUrls.length === 0) {
      return this.getDefaultBranding();
    }

    // Try each URL until one succeeds
    for (const url of githubUrls) {
      try {
        const bundle = await this.fetchOCABundleFromGitHub(url);
        if (bundle.logo || bundle.backgroundImage || bundle.colors.primary !== '#00698c') {
          console.log(`[UnifiedOCA] Successfully fetched bundle from: ${url}`);
          return bundle;
        }
      } catch (error) {
        console.log(`[UnifiedOCA] Failed to fetch from ${url}, trying next...`);
        continue;
      }
    }

    // If all fail, return default branding
    console.log(`[UnifiedOCA] All URLs failed, using default branding`);
    return this.getDefaultBranding();
  }

  /**
   * Extract repository ID from GitHub URL
   */
  private static extractRepositoryId(githubUrl: string): string {
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? `${match[1]}/${match[2]}` : 'unknown';
  }

  /**
   * Extract bundle path from GitHub URL
   */
  private static extractBundlePath(githubUrl: string): string {
    const match = githubUrl.match(/\/tree\/[^\/]+\/(.+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get default LSBC branding
   */
  private static getDefaultBranding(): StandardizedOCABranding {
    return {
      colors: {
        primary: '#00698c',
        secondary: '#1a2930'
      },
      layout: 'banner-bottom',
      metadata: {
        processedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Convert legacy OCA branding format to standardized format
   */
  static standardizeLegacyBranding(legacyBranding: any): StandardizedOCABranding {
    return {
      logo: legacyBranding.logo,
      backgroundImage: legacyBranding.background_image || legacyBranding.backgroundImage,
      colors: {
        primary: legacyBranding.primary_background_color || legacyBranding.colors?.primary || '#00698c',
        secondary: legacyBranding.secondary_background_color || legacyBranding.colors?.secondary || '#1a2930'
      },
      layout: legacyBranding.layout || 'banner-bottom',
      metadata: {
        ...(legacyBranding.metadata || {}),
        processedAt: legacyBranding.processedAt || new Date().toISOString()
      }
    };
  }
}