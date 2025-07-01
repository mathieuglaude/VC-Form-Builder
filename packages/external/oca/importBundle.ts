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

function toRaw(url: string): string {
  // GitHub path like 'bcgov/aries-oca-bundles/...'
  if (!url.startsWith('http')) {
    return 'https://raw.githubusercontent.com/' + url.replace('/tree/', '/') + (url.endsWith('.json') ? '' : '/OCABundle.json');
  }
  // Full GitHub URL
  if (url.includes('github.com') && !url.includes('raw.githubusercontent')) {
    return url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/tree/', '/')
      .replace(/\/$/, '') +
      (url.endsWith('.json') ? '' : '/OCABundle.json');
  }
  return url;
}

export async function importOCABundle(pathOrRaw: string) {
  // 1️⃣ Normalize: if the string ends with ".json" keep it; else append "/OCABundle.json"
  const rawJsonUrl = pathOrRaw.endsWith('.json')
    ? toRaw(pathOrRaw)
    : toRaw(pathOrRaw.replace(/\/$/, '') + '/OCABundle.json');

  // 2️⃣ Derive overlay base dir for asset download
  const baseDir = rawJsonUrl.replace(/OCABundle\.json$/, 'overlays/branding/');

  // Fetch the OCA bundle
  const response = await fetch(rawJsonUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch OCA bundle: ${response.statusText}`);
  }
  
  const [bundle]: [OCABundle] = await response.json();
  
  // Validation
  if (!Array.isArray(bundle?.overlays)) {
    throw new Error('Invalid OCA bundle: overlays missing');
  }

  // Extract branding and meta overlays
  const branding = bundle.overlays.find(o => o.type.includes('branding'));
  const meta = bundle.overlays.find(o => o.type.includes('meta'));

  // Cache artwork locally if present
  if (branding?.data?.logo) {
    const logoUrl = baseDir + branding.data.logo;
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