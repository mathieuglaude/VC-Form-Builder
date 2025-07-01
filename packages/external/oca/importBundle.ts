import { db } from '../../../apps/api/db';
import { credentialTemplates } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface OCABundle {
  schema_id: string;
  name?: string;
  version?: string;
  cred_def_id?: string;
  overlays: Array<{
    type: string;
    data: any;
  }>;
}

export async function importOCABundle(url: string) {
  // Fetch the OCA bundle
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OCA bundle: ${response.statusText}`);
  }
  
  const [bundle]: [OCABundle] = await response.json();

  // Extract branding and meta overlays
  const branding = bundle.overlays.find(o => o.type.includes('branding'));
  const meta = bundle.overlays.find(o => o.type.includes('meta'));

  // Cache artwork locally if present
  if (branding?.data?.logo) {
    const logoUrl = url.replace(/OCABundle.json$/, 'overlays/branding/' + branding.data.logo);
    try {
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        // For now, keep the original URL - we could implement local caching later
        branding.data.logoUrl = logoUrl;
      }
    } catch (error) {
      console.warn('Failed to cache logo:', error);
    }
  }

  // Create or update credential template
  const existingTemplate = await db
    .select()
    .from(credentialTemplates)
    .where(eq(credentialTemplates.schemaId, bundle.schema_id))
    .limit(1);

  const templateData = {
    label: meta?.data?.name || bundle.name || 'Unknown Credential',
    version: bundle.version || '1.0',
    schemaId: bundle.schema_id,
    credDefId: bundle.cred_def_id || '',
    issuerDid: meta?.data?.issuer_did || '',
    overlays: bundle.overlays,
    visible: true,
    updatedAt: new Date(),
  };

  if (existingTemplate.length > 0) {
    // Update existing template
    const [updated] = await db
      .update(credentialTemplates)
      .set(templateData)
      .where(eq(credentialTemplates.schemaId, bundle.schema_id))
      .returning();
    return updated;
  } else {
    // Create new template
    const [created] = await db
      .insert(credentialTemplates)
      .values(templateData)
      .returning();
    return created;
  }
}