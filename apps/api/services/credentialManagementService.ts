import ky from 'ky';
import { OrbitClient } from '@external/orbit/OrbitClient';

export interface ExternalSchemaImport {
  externalSchemaId: string;
  name: string;
  version: string;
  attributes: string[];
  governanceUrl?: string;
}

export interface ExternalCredentialDefinitionImport {
  externalCredDefId: string;
  orbitSchemaId: number;
  tag: string;
  issuerDid: string;
}

export interface SchemaImportResult {
  orbitSchemaId: number;
  status: 'imported' | 'existing';
}

export interface CredentialDefinitionImportResult {
  orbitCredDefId: number;
  status: 'imported' | 'existing';
}

export class CredentialManagementService {
  private baseURL: string;
  private apiKey: string;
  private lobId: string;

  constructor() {
    this.baseURL = 'https://testapi-credential.nborbit.ca/';
    this.apiKey = process.env.ORBIT_API_KEY;
    this.lobId = process.env.ORBIT_LOB_ID;

    console.log(`[CRED-MGMT] Initialized with Credential Management API: ${this.baseURL}`);
    
    if (!this.apiKey || !this.lobId) {
      throw new Error('ORBIT_API_KEY and ORBIT_LOB_ID must be set for credential management');
    }
  }

  async importExternalSchema(schemaData: ExternalSchemaImport): Promise<SchemaImportResult> {
    try {
      console.log(`[CRED-MGMT] Importing external schema: ${schemaData.externalSchemaId}`);
      
      // Build payload according to OpenAPI specification
      const schemaPayload = {
        schemaInfo: {
          schemaLedgerId: schemaData.externalSchemaId,
          governanceUrl: schemaData.governanceUrl || 'https://github.com/bcgov/digital-trust-toolkit',
          credentialFormat: 'ANONCRED' as const
        }
      };

      const requestUrl = `api/lob/${this.lobId}/schema/store`;
      console.log(`[CRED-MGMT] API Request Details:`);
      console.log(`  URL: ${this.baseURL}${requestUrl}`);
      console.log(`  Headers: { api-key: ${this.apiKey.substring(0, 8)}..., Content-Type: application/json }`);
      console.log(`  Payload:`, JSON.stringify(schemaPayload, null, 2));

      // Call Orbit Enterprise API to store external schema
      const response = await ky.post(requestUrl, {
        prefixUrl: this.baseURL,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        json: schemaPayload,
        timeout: 30000
      }).json<{ success: boolean; message: string; data: { schemaId: number } }>();

      console.log(`[CRED-MGMT] Schema import SUCCESS:`, response);

      return {
        orbitSchemaId: response.data.schemaId,
        status: 'imported'
      };
    } catch (error) {
      console.error('[CRED-MGMT] Schema import FAILED - Full error details:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('[CRED-MGMT] Error message:', error.message);
        console.error('[CRED-MGMT] Error stack:', error.stack);
      }
      
      throw new Error(`Failed to import schema into Orbit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importExternalCredentialDefinition(credDefData: ExternalCredentialDefinitionImport): Promise<CredentialDefinitionImportResult> {
    try {
      console.log(`[CRED-MGMT] Importing external credential definition: ${credDefData.externalCredDefId}`);
      
      // Build payload according to OpenAPI specification
      const credDefPayload = {
        schemaId: credDefData.orbitSchemaId,
        credentialDefinitionId: credDefData.externalCredDefId,
        description: `${credDefData.tag} credential issued by ${credDefData.issuerDid}`,
        addCredDef: false
      };

      const requestUrl = `api/lob/${this.lobId}/cred-def/store`;
      console.log(`[CRED-MGMT] Cred Def API Request Details:`);
      console.log(`  URL: ${this.baseURL}${requestUrl}`);
      console.log(`  Payload:`, JSON.stringify(credDefPayload, null, 2));

      // Call Orbit Enterprise API to store external credential definition
      const response = await ky.post(requestUrl, {
        prefixUrl: this.baseURL,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        json: credDefPayload,
        timeout: 30000
      }).json<{ success: boolean; message: string; data: { credentialId: number } }>();

      console.log(`[CRED-MGMT] Credential definition import SUCCESS:`, response);

      return {
        orbitCredDefId: response.data.credentialId,
        status: 'imported'
      };
    } catch (error) {
      console.error('[CRED-MGMT] Credential definition import FAILED - Full error details:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('[CRED-MGMT] Error message:', error.message);
        console.error('[CRED-MGMT] Error stack:', error.stack);
      }
      
      throw new Error(`Failed to import credential definition into Orbit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getImportStatus(externalSchemaId: string): Promise<{ orbitSchemaId?: number; orbitCredDefId?: number }> {
    try {
      // Query Orbit to check if external credentials are already imported
      const response = await ky.get(`api/lob/${this.lobId}/external-mappings`, {
        prefixUrl: this.baseURL,
        headers: {
          'api-key': this.apiKey
        },
        searchParams: {
          externalSchemaId
        }
      }).json<{ orbitSchemaId?: number; orbitCredDefId?: number }>();

      return response;
    } catch (error) {
      console.warn('[CRED-MGMT] Could not check import status:', error);
      return {};
    }
  }
}

// Export singleton instance
export const credentialManagementService = new CredentialManagementService();