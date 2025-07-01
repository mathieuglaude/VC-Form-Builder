import { db } from '../../../apps/api/db';
import { credentialTemplates } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface OCABundle {
  capture_base: {
    type: string;
    digest: string;
    classification?: string;
    attributes: Record<string, any>;
  };
  overlays: Array<{
    type: string;
    capture_base: string;
    [key: string]: any;
  }>;
  bundle_digest?: string;
}

export async function importOCABundle(url: string, governanceUrl?: string) {
  try {
    console.log(`Importing OCA bundle from: ${url}`);
    
    // Handle both direct file URLs and folder URLs
    let bundleUrl = url;
    if (url.includes('/tree/') || url.endsWith('/')) {
      // Convert GitHub folder URL to raw bundle.json URL
      bundleUrl = url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/tree/', '/')
        .replace(/\/$/, '') + '/bundle.json';
    } else if (!url.endsWith('.json')) {
      bundleUrl = url + '/bundle.json';
    }

    const response = await fetch(bundleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OCA bundle: ${response.status} ${response.statusText}`);
    }

    const bundle: OCABundle = await response.json();
    
    if (!bundle.capture_base) {
      throw new Error('Invalid OCA bundle: missing capture_base');
    }

    // Extract metadata overlay for label and description
    const metaOverlay = bundle.overlays?.find(overlay => overlay.type === 'oca/overlays/meta/1.0');
    const labelOverlay = bundle.overlays?.find(overlay => overlay.type === 'oca/overlays/label/1.0');
    const brandingOverlay = bundle.overlays?.find(overlay => overlay.type === 'oca/overlays/branding/1.0');

    // Generate schema ID from bundle digest or attributes
    const schemaId = bundle.bundle_digest || 
                    `${bundle.capture_base.classification || 'credential'}:${Date.now()}:1.0`;

    // Extract credential label
    const label = labelOverlay?.attr_labels?.credential_name || 
                  metaOverlay?.name ||
                  bundle.capture_base.classification ||
                  'Imported Credential';

    // Create or update credential template
    const credentialData = {
      label,
      version: '1.0',
      schemaId,
      credDefId: `${schemaId}:cred_def`,
      issuerDid: 'did:unknown:issuer', // Will be updated when actual issuer is known
      overlays: bundle.overlays || [],
      governanceUrl: governanceUrl || null,
      visible: true,
      updatedAt: new Date(),
    };

    // Check if credential already exists
    const existing = await db
      .select()
      .from(credentialTemplates)
      .where(eq(credentialTemplates.schemaId, schemaId))
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Update existing credential
      result = await db
        .update(credentialTemplates)
        .set(credentialData)
        .where(eq(credentialTemplates.schemaId, schemaId))
        .returning();
    } else {
      // Create new credential
      result = await db
        .insert(credentialTemplates)
        .values({
          ...credentialData,
          createdAt: new Date(),
        })
        .returning();
    }

    console.log(`Successfully imported credential: ${label}`);
    return result[0];

  } catch (error) {
    console.error('Failed to import OCA bundle:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}