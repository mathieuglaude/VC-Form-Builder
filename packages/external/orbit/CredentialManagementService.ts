/**
 * CredentialManagementService for Orbit Enterprise API integration
 * 
 * System of Record: https://github.com/4sure-tech/eapi-llm-friendly-format
 * 
 * This service handles importing external schemas and credential definitions into Orbit LOB
 * to enable the direct proof-request/url endpoint to work with external credentials.
 * 
 * Import Schema API: POST /api/lob/{lob_id}/schema/store
 * Import CredDef API: POST /api/lob/{lob_id}/cred-def/store
 * Base URL: https://testapi-credential.nborbit.ca (dev environment)
 */
export class CredentialManagementService {
  private baseUrl: string;

  constructor(
    private apiKey: string,
    private lobId: string,
    baseUrl: string = 'https://testapi-credential.nborbit.ca/'
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Import an external schema into Orbit LOB
   * Returns the numeric schema ID assigned by Orbit
   */
  async importExternalSchema(externalSchemaId: string): Promise<{
    success: boolean;
    orbitSchemaId?: number;
    error?: string;
  }> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      externalSchemaId: externalSchemaId
    };

    console.log('[ORBIT-SCHEMA-IMPORT] Importing external schema:', externalSchemaId);

    try {
      const response = await fetch(`${this.baseUrl}api/lob/${this.lobId}/schema/store`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('[ORBIT-SCHEMA-ERROR] Import failed:', response.status, result);
        return {
          success: false,
          error: `Schema import failed: ${response.status} ${JSON.stringify(result)}`
        };
      }

      console.log('[ORBIT-SCHEMA-SUCCESS] Schema imported:', result);
      
      // Extract the numeric schema ID from Orbit response
      const orbitSchemaId = result.schemaId || result.id;
      
      if (!orbitSchemaId) {
        return {
          success: false,
          error: 'Schema imported but no numeric ID returned'
        };
      }

      return {
        success: true,
        orbitSchemaId: orbitSchemaId
      };

    } catch (error) {
      console.log('[ORBIT-SCHEMA-ERROR] Network error:', error);
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import an external credential definition into Orbit LOB
   * Returns the numeric credential definition ID assigned by Orbit
   */
  async importExternalCredentialDefinition(
    externalCredDefId: string, 
    orbitSchemaId: number
  ): Promise<{
    success: boolean;
    orbitCredDefId?: number;
    error?: string;
  }> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      externalCredentialDefinitionId: externalCredDefId,
      schemaId: orbitSchemaId
    };

    console.log('[ORBIT-CREDDEF-IMPORT] Importing external credential definition:', externalCredDefId);

    try {
      const response = await fetch(`${this.baseUrl}api/lob/${this.lobId}/cred-def/store`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('[ORBIT-CREDDEF-ERROR] Import failed:', response.status, result);
        return {
          success: false,
          error: `CredDef import failed: ${response.status} ${JSON.stringify(result)}`
        };
      }

      console.log('[ORBIT-CREDDEF-SUCCESS] CredDef imported:', result);
      
      // Extract the numeric credential definition ID from Orbit response
      const orbitCredDefId = result.credentialDefinitionId || result.id;
      
      if (!orbitCredDefId) {
        return {
          success: false,
          error: 'CredDef imported but no numeric ID returned'
        };
      }

      return {
        success: true,
        orbitCredDefId: orbitCredDefId
      };

    } catch (error) {
      console.log('[ORBIT-CREDDEF-ERROR] Network error:', error);
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import both schema and credential definition for a credential template
   * This is the main method to use when adding a new credential to the system
   */
  async importCredentialTemplate(
    externalSchemaId: string,
    externalCredDefId: string
  ): Promise<{
    success: boolean;
    orbitSchemaId?: number;
    orbitCredDefId?: number;
    error?: string;
  }> {
    // First import the schema
    const schemaResult = await this.importExternalSchema(externalSchemaId);
    
    if (!schemaResult.success) {
      return {
        success: false,
        error: `Schema import failed: ${schemaResult.error}`
      };
    }

    // Then import the credential definition
    const credDefResult = await this.importExternalCredentialDefinition(
      externalCredDefId, 
      schemaResult.orbitSchemaId!
    );

    if (!credDefResult.success) {
      return {
        success: false,
        error: `CredDef import failed: ${credDefResult.error}`
      };
    }

    return {
      success: true,
      orbitSchemaId: schemaResult.orbitSchemaId!,
      orbitCredDefId: credDefResult.orbitCredDefId!
    };
  }
}