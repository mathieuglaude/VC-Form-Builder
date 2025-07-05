#!/usr/bin/env tsx

/**
 * Migration script to transform existing credential templates to unified OCA structure
 * This script reads existing fragmented credential data and restructures it according to OCA principles
 */

import { db } from '../db.js';
import type { 
  SchemaMetadata, 
  CryptographicMetadata, 
  BrandingMetadata, 
  EcosystemMetadata, 
  OrbitIntegration 
} from '@shared/schema';

interface LegacyCredential {
  id: number;
  label: string;
  version: string;
  schemaId: string;
  credDefId: string;
  issuerDid: string;
  attributes: Array<{ name: string; description: string; }>;
  ecosystem?: string;
  interopProfile?: string;
  compatibleWallets?: string[];
  walletRestricted?: boolean;
  branding?: any;
  metaOverlay?: any;
  ledgerNetwork?: string;
  primaryColor?: string;
  brandBgUrl?: string;
  brandLogoUrl?: string;
  governanceUrl?: string;
  orbitSchemaId?: number;
  orbitCredDefId?: number;
  isPredefined?: boolean;
  visible?: boolean;
}

async function migrateCredentialTemplates() {
  console.log('🔄 Starting migration to unified credential metadata structure...');
  
  try {
    // Read existing credential data using raw SQL to avoid schema conflicts
    const rawCredentials = await db.execute(`
      SELECT 
        id, label, version, schema_id, cred_def_id, issuer_did,
        attributes, ecosystem, interop_profile, compatible_wallets,
        wallet_restricted, branding, meta_overlay, ledger_network,
        primary_color, brand_bg_url, brand_logo_url, governance_url,
        orbit_schema_id, orbit_cred_def_id, is_predefined, visible,
        created_at, updated_at
      FROM credential_templates
    `);

    if (!rawCredentials.rows || rawCredentials.rows.length === 0) {
      console.log('No existing credentials found to migrate');
      return;
    }

    console.log(`Found ${rawCredentials.rows.length} credentials to migrate`);

    // Drop and recreate the table with new structure
    await db.execute('DROP TABLE IF EXISTS credential_templates CASCADE');
    
    // Create the new unified table structure
    await db.execute(`
      CREATE TABLE credential_templates (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        version TEXT NOT NULL,
        schema_metadata JSONB NOT NULL,
        cryptographic_metadata JSONB NOT NULL,
        branding_metadata JSONB NOT NULL,
        ecosystem_metadata JSONB NOT NULL,
        orbit_integration JSONB,
        is_predefined BOOLEAN NOT NULL DEFAULT false,
        visible BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Transform and insert each credential
    for (const row of rawCredentials.rows) {
      const legacy = row as any as LegacyCredential;
      
      // Build unified metadata structure
      const schemaMetadata: SchemaMetadata = {
        schemaId: legacy.schemaId,
        schemaName: legacy.label,
        schemaVersion: legacy.version,
        attributes: legacy.attributes || [],
      };

      const cryptographicMetadata: CryptographicMetadata = {
        issuerDid: legacy.issuerDid,
        credDefId: legacy.credDefId,
        governanceFramework: legacy.governanceUrl,
      };

      const brandingMetadata: BrandingMetadata = {
        displayName: legacy.label,
        description: legacy.metaOverlay?.description || `Official ${legacy.label} credential`,
        issuerName: legacy.metaOverlay?.issuer || 'Government of British Columbia',
        issuerWebsite: legacy.metaOverlay?.issuerUrl,
        logo: {
          url: legacy.brandLogoUrl || legacy.branding?.logoUrl || '',
          altText: `${legacy.label} logo`,
        },
        colors: {
          primary: legacy.primaryColor || legacy.branding?.primaryColor || '#4F46E5',
          secondary: legacy.branding?.secondaryColor,
        },
        backgroundImage: legacy.brandBgUrl || legacy.branding?.backgroundImage ? {
          url: legacy.brandBgUrl || legacy.branding?.backgroundImage,
          position: 'center',
        } : undefined,
        layout: (legacy.branding?.layout || 'standard') as any,
      };

      const ecosystemMetadata: EcosystemMetadata = {
        ecosystem: legacy.ecosystem || 'BC Ecosystem',
        interopProfile: legacy.interopProfile || 'AIP 2.0',
        compatibleWallets: legacy.compatibleWallets || ['BC Wallet'],
        walletRestricted: legacy.walletRestricted || false,
        ledgerNetwork: legacy.ledgerNetwork || 'BCOVRIN_TEST',
      };

      const orbitIntegration: OrbitIntegration | undefined = legacy.orbitSchemaId ? {
        orbitSchemaId: legacy.orbitSchemaId,
        orbitCredDefId: legacy.orbitCredDefId,
      } : undefined;

      // Insert transformed credential
      const insertQuery = `
        INSERT INTO credential_templates (
          label, version, schema_metadata, cryptographic_metadata,
          branding_metadata, ecosystem_metadata, orbit_integration,
          is_predefined, visible
        ) VALUES (
          '${legacy.label.replace(/'/g, "''")}',
          '${legacy.version}',
          '${JSON.stringify(schemaMetadata).replace(/'/g, "''")}',
          '${JSON.stringify(cryptographicMetadata).replace(/'/g, "''")}',
          '${JSON.stringify(brandingMetadata).replace(/'/g, "''")}',
          '${JSON.stringify(ecosystemMetadata).replace(/'/g, "''")}',
          ${orbitIntegration ? `'${JSON.stringify(orbitIntegration).replace(/'/g, "''")}'` : 'NULL'},
          ${legacy.isPredefined || false},
          ${legacy.visible !== false}
        )
      `;
      
      await db.execute(insertQuery);

      console.log(`✅ Migrated: ${legacy.label}`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('All credentials have been restructured according to OCA principles');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCredentialTemplates().catch(console.error);
}

export { migrateCredentialTemplates };