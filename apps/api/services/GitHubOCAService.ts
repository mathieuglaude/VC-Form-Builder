import { OCABundleClient } from '@external/oca/OCABundleClient';

interface GitHubOCABundle {
  logo?: string;
  backgroundImage?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  layout?: string;
}

/**
 * Service for fetching OCA bundles from GitHub repositories
 * Handles BC Government OCA bundle structure
 */
export class GitHubOCAService {
  private ocaClient: OCABundleClient;

  constructor() {
    this.ocaClient = new OCABundleClient();
  }

  /**
   * Convert GitHub tree URL to raw content URLs for OCA bundle files
   */
  private convertGitHubTreeToRawUrls(githubTreeUrl: string): { bundleUrl: string; baseUrl: string } {
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
  async fetchFromGitHub(githubTreeUrl: string): Promise<GitHubOCABundle> {
    try {
      console.log(`[GitHubOCA] Fetching OCA bundle from: ${githubTreeUrl}`);
      
      const { bundleUrl, baseUrl } = this.convertGitHubTreeToRawUrls(githubTreeUrl);
      
      console.log(`[GitHubOCA] Converted to bundle URL: ${bundleUrl}`);
      
      // Fetch the OCA bundle JSON
      const response = await fetch(bundleUrl);
      
      if (!response.ok) {
        console.log(`[GitHubOCA] Bundle not found at ${bundleUrl}, trying alternative structure...`);
        
        // Try alternative bundle file names
        const alternativeUrls = [
          `${baseUrl}/bundle.json`,
          `${baseUrl}/oca-bundle.json`,
          `${baseUrl}/overlay.json`
        ];
        
        let bundleData = null;
        for (const altUrl of alternativeUrls) {
          try {
            const altResponse = await fetch(altUrl);
            if (altResponse.ok) {
              bundleData = await altResponse.json();
              console.log(`[GitHubOCA] Found bundle at: ${altUrl}`);
              break;
            }
          } catch (error) {
            // Continue to next alternative
          }
        }
        
        if (!bundleData) {
          throw new Error(`No OCA bundle found at ${githubTreeUrl}`);
        }
        
        return this.processOCABundle(bundleData, baseUrl);
      }
      
      const bundleData = await response.json();
      return this.processOCABundle(bundleData, baseUrl);
      
    } catch (error) {
      console.error(`[GitHubOCA] Error fetching bundle from ${githubTreeUrl}:`, error);
      throw error;
    }
  }

  /**
   * Process OCA bundle JSON and extract branding assets
   */
  private async processOCABundle(bundleData: any, baseUrl: string): Promise<GitHubOCABundle> {
    const result: GitHubOCABundle = {
      layout: 'banner-bottom' // Default for LSBC
    };

    try {
      // Look for branding overlay in the bundle
      const overlays = bundleData.overlays || [];
      const brandingOverlay = overlays.find((overlay: any) => 
        overlay.type === 'oca/branding/1.0' || overlay.type?.includes('branding')
      );

      if (brandingOverlay) {
        console.log(`[GitHubOCA] Found branding overlay:`, brandingOverlay);
        
        // Extract colors
        if (brandingOverlay.primary_background_color || brandingOverlay.primary_colour) {
          result.colors = {
            primary: brandingOverlay.primary_background_color || brandingOverlay.primary_colour || '#00698c',
            secondary: brandingOverlay.secondary_background_color || brandingOverlay.secondary_colour || '#1a2930'
          };
        }

        // Extract logo
        if (brandingOverlay.logo) {
          // Convert relative path to absolute GitHub raw URL
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
      }

      // Try to find logo and background files in common locations if not in overlay
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
              console.log(`[GitHubOCA] Found logo at: ${logoUrl}`);
              break;
            }
          } catch (error) {
            // Continue to next URL
          }
        }
      }

      // Default LSBC colors if not found
      if (!result.colors) {
        result.colors = {
          primary: '#00698c', // LSBC teal
          secondary: '#1a2930' // LSBC dark grey
        };
      }

      console.log(`[GitHubOCA] Processed bundle result:`, result);
      return result;

    } catch (error) {
      console.error(`[GitHubOCA] Error processing bundle:`, error);
      
      // Return basic LSBC branding as fallback
      return {
        colors: {
          primary: '#00698c',
          secondary: '#1a2930'
        },
        layout: 'banner-bottom'
      };
    }
  }

  /**
   * Fetch multiple OCA bundles and merge results
   */
  async fetchMultipleBundles(githubUrls: string[]): Promise<GitHubOCABundle> {
    if (githubUrls.length === 0) {
      throw new Error('No GitHub URLs provided');
    }

    // Try each URL until one succeeds
    for (const url of githubUrls) {
      try {
        const bundle = await this.fetchFromGitHub(url);
        console.log(`[GitHubOCA] Successfully fetched bundle from: ${url}`);
        return bundle;
      } catch (error) {
        console.log(`[GitHubOCA] Failed to fetch from ${url}, trying next...`);
        continue;
      }
    }

    // If all fail, return LSBC default branding
    console.log(`[GitHubOCA] All URLs failed, using default LSBC branding`);
    return {
      colors: {
        primary: '#00698c',
        secondary: '#1a2930'
      },
      layout: 'banner-bottom'
    };
  }
}

export const githubOCAService = new GitHubOCAService();