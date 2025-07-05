import { ocaBundleClient, type OCABranding, type OCABundle, type OCAAsset } from '../../../packages/external/oca/OCABundleClient';
import { db } from '../db';
import { credentialTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * OCA Service for integrating OCA bundles with credential templates
 * Handles fetching, processing, and storing OCA branding data
 */

export interface ProcessedOCABranding extends OCABranding {
  processedAt: Date;
  repositoryId: string;
  bundlePath: string;
  assets?: OCAAsset[];
}

export class OCAService {
  /**
   * Fetch and process OCA bundle for a credential template
   */
  async fetchOCABundleForCredential(credentialId: number): Promise<ProcessedOCABranding | null> {
    try {
      // Get credential template from database
      const [credential] = await db
        .select()
        .from(credentialTemplates)
        .where(eq(credentialTemplates.id, credentialId));

      if (!credential) {
        throw new Error(`Credential template ${credentialId} not found`);
      }

      // Extract OCA bundle URL from credential metadata
      const ocaBundleUrl = this.extractOCABundleUrl(credential.brandingMetadata as any);
      if (!ocaBundleUrl) {
        console.warn(`No OCA bundle URL found for credential ${credential.label}`);
        return null;
      }

      // Parse repository and bundle path from URL
      const { repositoryId, bundlePath } = this.parseOCABundleUrl(ocaBundleUrl);
      
      // Fetch the bundle with assets
      const { bundle, assets } = await ocaBundleClient.getOCABundleWithAssets(repositoryId, bundlePath);

      if (!bundle.branding) {
        console.warn(`No branding found in OCA bundle for ${credential.label}`);
        return null;
      }

      // Process and enhance branding data
      const processedBranding: ProcessedOCABranding = {
        ...bundle.branding,
        processedAt: new Date(),
        repositoryId,
        bundlePath,
        assets,
        metadata: {
          ...(bundle.branding.metadata || {}),
          name: credential.label,
          issuer: this.extractIssuerName(credential.brandingMetadata as any),
          version: credential.version
        }
      };

      // Update credential template with processed branding
      await this.storeBrandingData(credentialId, processedBranding);

      return processedBranding;
    } catch (error) {
      console.error(`Failed to fetch OCA bundle for credential ${credentialId}:`, error);
      throw error;
    }
  }

  /**
   * Get cached OCA branding for a credential
   */
  async getCachedBranding(credentialId: number): Promise<ProcessedOCABranding | null> {
    try {
      const [credential] = await db
        .select()
        .from(credentialTemplates)
        .where(eq(credentialTemplates.id, credentialId));

      if (!credential || !credential.brandingMetadata) {
        console.log(`No OCA bundle URL found for credential ${credential?.label || 'unknown'}`);
        return null;
      }

      const branding = credential.brandingMetadata as any;
      console.log(`Branding data for credential ${credentialId}:`, JSON.stringify(branding, null, 2));
      
      // Check if we have processed OCA branding (legacy format)
      if (branding.processedAt && branding.type === 'aries/overlays/branding/1.0') {
        return branding as ProcessedOCABranding;
      }

      // Handle imported credential branding format from wizard
      if (branding.colors || branding.logo || branding.backgroundImage || branding.primaryColor) {
        const processedBranding: ProcessedOCABranding = {
          primary_background_color: branding.colors?.primary || branding.primaryColor || '#4F46E5',
          secondary_background_color: branding.colors?.secondary || branding.secondaryColor || '#6B7280',
          logo: branding.logo?.url || branding.logo || null,
          background_image: branding.backgroundImage?.url || branding.backgroundImage || null,
          processedAt: new Date(),
          repositoryId: 'imported',
          bundlePath: 'imported-credential'
        };
        
        console.log(`Generated processed branding for credential ${credentialId}:`, JSON.stringify(processedBranding, null, 2));
        return processedBranding;
      }

      return null;
    } catch (error) {
      console.error(`Failed to get cached branding for credential ${credentialId}:`, error);
      return null;
    }
  }

  /**
   * Refresh OCA bundle data for a credential
   */
  async refreshOCABundle(credentialId: number): Promise<ProcessedOCABranding | null> {
    // Clear cache by fetching fresh data
    return this.fetchOCABundleForCredential(credentialId);
  }

  /**
   * Bulk fetch OCA bundles for all credentials that have OCA bundle URLs
   */
  async refreshAllOCABundles(): Promise<{ success: number; failed: number; results: Array<{ id: number; status: string }> }> {
    const credentials = await db.select().from(credentialTemplates);
    const results: Array<{ id: number; status: string }> = [];
    let success = 0;
    let failed = 0;

    for (const credential of credentials) {
      try {
        const ocaBundleUrl = this.extractOCABundleUrl(credential.brandingMetadata as any);
        if (ocaBundleUrl) {
          await this.fetchOCABundleForCredential(credential.id);
          results.push({ id: credential.id, status: 'success' });
          success++;
        } else {
          results.push({ id: credential.id, status: 'no_oca_url' });
        }
      } catch (error) {
        results.push({ id: credential.id, status: `failed: ${error}` });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * Get available OCA repositories
   */
  getAvailableRepositories() {
    return ocaBundleClient.getRepositories();
  }

  /**
   * Add a new OCA repository
   */
  addRepository(repo: { id: string; name: string; baseUrl: string; type: 'github' | 'direct' }) {
    ocaBundleClient.addRepository(repo);
  }

  /**
   * Test connectivity to an OCA bundle URL
   */
  async testOCABundleUrl(url: string): Promise<{ valid: boolean; bundle?: OCABundle; error?: string }> {
    try {
      const { repositoryId, bundlePath } = this.parseOCABundleUrl(url);
      const bundle = await ocaBundleClient.fetchOCABundle(repositoryId, bundlePath);
      return { valid: true, bundle };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }

  private async storeBrandingData(credentialId: number, branding: ProcessedOCABranding): Promise<void> {
    await db
      .update(credentialTemplates)
      .set({
        brandingMetadata: branding as any,
        updatedAt: new Date()
      })
      .where(eq(credentialTemplates.id, credentialId));
  }

  private extractOCABundleUrl(brandingMetadata: any): string | null {
    if (!brandingMetadata) return null;
    
    // Check for ocaBundleUrl field
    if (typeof brandingMetadata.ocaBundleUrl === 'string') {
      return brandingMetadata.ocaBundleUrl;
    }
    
    // Check for bundleUrl field (legacy)
    if (typeof brandingMetadata.bundleUrl === 'string') {
      return brandingMetadata.bundleUrl;
    }

    return null;
  }

  private extractIssuerName(brandingMetadata: any): string {
    if (!brandingMetadata) return 'Digital Issuer';
    
    // Try various fields that might contain issuer name
    return brandingMetadata.issuerName || 
           brandingMetadata.issuer || 
           brandingMetadata.organization || 
           'Digital Issuer';
  }

  private parseOCABundleUrl(url: string): { repositoryId: string; bundlePath: string } {
    // Parse BC Government GitHub URLs
    if (url.includes('github.com/bcgov/aries-oca-bundles')) {
      const match = url.match(/\/aries-oca-bundles\/tree\/main\/(.+)$/);
      if (match) {
        return {
          repositoryId: 'bcgov',
          bundlePath: match[1]
        };
      }
    }

    // Parse raw GitHub URLs
    if (url.includes('raw.githubusercontent.com/bcgov/aries-oca-bundles')) {
      const match = url.match(/\/aries-oca-bundles\/main\/(.+)$/);
      if (match) {
        const bundlePath = match[1].replace(/\/[^/]+$/, ''); // Remove filename to get directory
        return {
          repositoryId: 'bcgov',
          bundlePath
        };
      }
    }

    // For direct URLs, try to extract repository info
    // This is a simplified parser - can be extended for other repositories
    throw new Error(`Unable to parse OCA bundle URL: ${url}`);
  }
}

// Export singleton instance
export const ocaService = new OCAService();