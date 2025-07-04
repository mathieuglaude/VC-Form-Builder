import { db } from '../../db.js';
import { orbitSchemas, orbitCredentialDefinitions } from '../../../../packages/shared/schema.js';
import { CredentialManagementService } from '../../../../packages/external/orbit/CredentialManagementService.js';
import { eq } from 'drizzle-orm';

/**
 * Service to handle importing external credentials into Orbit and storing mappings
 */
export class CredentialImportService {
  private credentialMgmtService: CredentialManagementService;

  constructor(apiKey: string, lobId: string) {
    this.credentialMgmtService = new CredentialManagementService(apiKey, lobId);
  }

  /**
   * Import a credential template into Orbit and store the mappings in our database
   * This makes external credentials work with the direct proof-request/url endpoint
   */
  async importCredentialTemplate(
    externalSchemaId: string,
    externalCredDefId: string,
    schemaName: string,
    schemaVersion: string,
    issuerDid: string,
    attributes: string[]
  ): Promise<{
    success: boolean;
    orbitSchemaId?: number;
    orbitCredDefId?: number;
    error?: string;
  }> {
    console.log('[IMPORT-SERVICE] Starting import for:', externalSchemaId, externalCredDefId);

    // Check if already imported
    const existingSchema = await db
      .select()
      .from(orbitSchemas)
      .where(eq(orbitSchemas.externalSchemaId, externalSchemaId))
      .limit(1);

    if (existingSchema.length > 0) {
      const existingCredDef = await db
        .select()
        .from(orbitCredentialDefinitions)
        .where(eq(orbitCredentialDefinitions.externalCredDefId, externalCredDefId))
        .limit(1);

      if (existingCredDef.length > 0) {
        console.log('[IMPORT-SERVICE] Already imported, using existing mappings');
        return {
          success: true,
          orbitSchemaId: existingSchema[0].orbitSchemaId,
          orbitCredDefId: existingCredDef[0].orbitCredDefId
        };
      }
    }

    try {
      // Import into Orbit
      const importResult = await this.credentialMgmtService.importCredentialTemplate(
        externalSchemaId,
        externalCredDefId
      );

      if (!importResult.success) {
        console.log('[IMPORT-SERVICE] Orbit import failed:', importResult.error);
        return importResult;
      }

      // Store schema mapping in database
      if (existingSchema.length === 0) {
        await db.insert(orbitSchemas).values({
          externalSchemaId,
          orbitSchemaId: importResult.orbitSchemaId!,
          schemaName,
          schemaVersion,
          issuerDid,
          attributes
        });
        console.log('[IMPORT-SERVICE] Schema mapping stored');
      }

      // Store credential definition mapping in database
      await db.insert(orbitCredentialDefinitions).values({
        externalCredDefId,
        orbitCredDefId: importResult.orbitCredDefId!,
        orbitSchemaId: importResult.orbitSchemaId!,
        externalSchemaId,
        issuerDid,
        tag: 'default'
      });
      console.log('[IMPORT-SERVICE] CredDef mapping stored');

      console.log('[IMPORT-SERVICE] Import completed successfully');
      return importResult;

    } catch (error) {
      console.error('[IMPORT-SERVICE] Database error:', error);
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get the Orbit numeric IDs for an external credential
   * Returns null if not imported yet
   */
  async getOrbitMapping(externalSchemaId: string, externalCredDefId: string): Promise<{
    orbitSchemaId: number;
    orbitCredDefId: number;
  } | null> {
    try {
      const result = await db
        .select({
          orbitSchemaId: orbitCredentialDefinitions.orbitSchemaId,
          orbitCredDefId: orbitCredentialDefinitions.orbitCredDefId
        })
        .from(orbitCredentialDefinitions)
        .where(eq(orbitCredentialDefinitions.externalCredDefId, externalCredDefId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      console.error('[IMPORT-SERVICE] Error fetching mapping:', error);
      return null;
    }
  }

  /**
   * Auto-import credentials when needed for proof requests
   * This will be called when generating proof requests for external credentials
   */
  async ensureCredentialImported(
    credentialTemplate: any
  ): Promise<{
    orbitSchemaId: number;
    orbitCredDefId: number;
  } | null> {
    const existing = await this.getOrbitMapping(
      credentialTemplate.schemaId,
      credentialTemplate.credDefId
    );

    if (existing) {
      return existing;
    }

    // Auto-import the credential
    const importResult = await this.importCredentialTemplate(
      credentialTemplate.schemaId,
      credentialTemplate.credDefId,
      credentialTemplate.label.split(' v')[0], // Extract schema name
      credentialTemplate.version,
      credentialTemplate.issuerDid,
      credentialTemplate.attributes?.map((attr: any) => attr.name) || []
    );

    if (!importResult.success) {
      console.error('[IMPORT-SERVICE] Auto-import failed:', importResult.error);
      return null;
    }

    return {
      orbitSchemaId: importResult.orbitSchemaId!,
      orbitCredDefId: importResult.orbitCredDefId!
    };
  }
}