import ky from 'ky';

/**
 * OCA Bundle Client for fetching and parsing OCA bundles from various repositories
 * Supports BC Government aries-oca-bundles and other future repositories
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
  metadata?: {
    name?: string;
    description?: string;
    issuer?: string;
    version?: string;
    schema_id?: string;
    cred_def_id?: string;
  };
}

export interface OCAOverlay {
  type: string;
  capture_base?: string;
  [key: string]: any;
}

export interface OCABundle {
  bundle_id?: string;
  overlays: OCAOverlay[];
  branding?: OCABranding;
  metadata?: {
    name?: string;
    description?: string;
    issuer?: string;
    version?: string;
    schema_id?: string;
    cred_def_id?: string;
  };
}

export interface OCARepository {
  id: string;
  name: string;
  baseUrl: string;
  type: 'github' | 'direct';
  organization?: string;
  repository?: string;
  branch?: string;
}

export interface OCAAsset {
  filename: string;
  url: string;
  localPath?: string;
  size?: number;
  contentType?: string;
}

export class OCABundleClient {
  private repositories: Map<string, OCARepository> = new Map();
  private assetCache: Map<string, string> = new Map();

  constructor() {
    // Default BC Government repository
    this.addRepository({
      id: 'bcgov',
      name: 'BC Government OCA Bundles',
      baseUrl: 'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main',
      type: 'github',
      organization: 'bcgov',
      repository: 'aries-oca-bundles',
      branch: 'main'
    });
  }

  /**
   * Add a new OCA bundle repository
   */
  addRepository(repo: OCARepository): void {
    this.repositories.set(repo.id, repo);
  }

  /**
   * Remove an OCA bundle repository
   */
  removeRepository(repoId: string): void {
    this.repositories.delete(repoId);
  }

  /**
   * Get all registered repositories
   */
  getRepositories(): OCARepository[] {
    return Array.from(this.repositories.values());
  }

  /**
   * Fetch OCA bundle from a specific path within a repository
   */
  async fetchOCABundle(repoId: string, bundlePath: string): Promise<OCABundle> {
    const repo = this.repositories.get(repoId);
    if (!repo) {
      throw new Error(`Repository ${repoId} not found`);
    }

    try {
      // Try to fetch the main OCABundle.json file
      const bundleUrl = `${repo.baseUrl}/${bundlePath}/OCABundle.json`;
      const bundleResponse = await ky.get(bundleUrl).json<OCABundle>();

      // Also try to fetch branding.json separately if it exists
      let branding: OCABranding | undefined;
      try {
        const brandingUrl = `${repo.baseUrl}/${bundlePath}/branding.json`;
        const brandingData = await ky.get(brandingUrl).json<OCABranding | OCABranding[]>();
        
        // Handle both single object and array formats
        branding = Array.isArray(brandingData) ? brandingData[0] : brandingData;
      } catch (error) {
        console.warn(`No branding.json found at ${bundlePath}`);
      }

      return {
        ...bundleResponse,
        branding: branding || bundleResponse.branding,
        metadata: {
          ...bundleResponse.metadata,
          // Extract additional metadata from the bundle path
          name: bundlePath.split('/').pop() || 'Unknown'
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch OCA bundle from ${bundlePath}: ${error}`);
    }
  }

  /**
   * Fetch and cache an asset (logo, background image, etc.)
   */
  async fetchAsset(assetUrl: string): Promise<OCAAsset> {
    // Check cache first
    const cached = this.assetCache.get(assetUrl);
    if (cached) {
      return {
        filename: this.getFilenameFromUrl(assetUrl),
        url: assetUrl,
        localPath: cached
      };
    }

    try {
      const response = await ky.get(assetUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Convert to base64 for storage/caching
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${blob.type};base64,${base64Data}`;
      
      this.assetCache.set(assetUrl, dataUrl);

      return {
        filename: this.getFilenameFromUrl(assetUrl),
        url: assetUrl,
        localPath: dataUrl,
        size: buffer.length,
        contentType: blob.type
      };
    } catch (error) {
      throw new Error(`Failed to fetch asset ${assetUrl}: ${error}`);
    }
  }

  /**
   * Parse a branding.json structure and download associated assets
   */
  async processBranding(branding: OCABranding): Promise<{
    branding: OCABranding;
    assets: OCAAsset[];
  }> {
    const assets: OCAAsset[] = [];
    const processedBranding = { ...branding };

    // Process logo
    if (branding.logo && this.isUrl(branding.logo)) {
      try {
        const logoAsset = await this.fetchAsset(branding.logo);
        assets.push(logoAsset);
      } catch (error) {
        console.warn(`Failed to fetch logo: ${error}`);
      }
    }

    // Process background image
    if (branding.background_image && this.isUrl(branding.background_image)) {
      try {
        const bgAsset = await this.fetchAsset(branding.background_image);
        assets.push(bgAsset);
      } catch (error) {
        console.warn(`Failed to fetch background image: ${error}`);
      }
    }

    // Process background image slice
    if (branding.background_image_slice && this.isUrl(branding.background_image_slice)) {
      try {
        const sliceAsset = await this.fetchAsset(branding.background_image_slice);
        assets.push(sliceAsset);
      } catch (error) {
        console.warn(`Failed to fetch background image slice: ${error}`);
      }
    }

    return {
      branding: processedBranding,
      assets
    };
  }

  /**
   * Discover available OCA bundles in a repository (for BC Gov repo structure)
   */
  async discoverBundles(repoId: string): Promise<string[]> {
    const repo = this.repositories.get(repoId);
    if (!repo || repo.type !== 'github') {
      throw new Error(`Repository ${repoId} not found or not a GitHub repository`);
    }

    // For BC Gov repo, we know the structure is /OCABundles/schema/...
    // This would require GitHub API to discover, for now return known paths
    return [
      'OCABundles/schema/bcgov-digital-trust/business-card',
      'OCABundles/schema/bcgov-digital-trust/person',
      'OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Prod'
    ];
  }

  /**
   * Get comprehensive OCA bundle information including processed assets
   */
  async getOCABundleWithAssets(repoId: string, bundlePath: string): Promise<{
    bundle: OCABundle;
    assets: OCAAsset[];
  }> {
    const bundle = await this.fetchOCABundle(repoId, bundlePath);
    
    if (bundle.branding) {
      const { branding, assets } = await this.processBranding(bundle.branding);
      return {
        bundle: {
          ...bundle,
          branding
        },
        assets
      };
    }

    return {
      bundle,
      assets: []
    };
  }

  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || 'unknown';
    } catch {
      return url.split('/').pop() || 'unknown';
    }
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const ocaBundleClient = new OCABundleClient();