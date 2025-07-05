import ky from 'ky';
import { OrbitClient } from '@external/orbit/OrbitClient';

export interface ExternalSchemaImport {
  externalSchemaId: string;
  name: string;
  version: string;
  attributes: string[];
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
    this.baseURL = process.env.ORBIT_LOB_BASE_URL || 'https://testapi-credential.nborbit.ca/';
    this.apiKey = process.env.ORBIT_API_KEY;
    this.lobId = process.env.ORBIT_LOB_ID;

    if (!this.apiKey || !this.lobId) {
      throw new Error('ORBIT_API_KEY and ORBIT_LOB_ID must be set for credential management');
    }
  }

  async importExternalSchema(schemaData: ExternalSchemaImport): Promise<SchemaImportResult> {
    try {
      console.log(`[CRED-MGMT] Importing external schema: ${schemaData.externalSchemaId}`);
      
      // Prepare schema payload for Orbit API
      const schemaPayload = {
        name: schemaData.name,
        version: schemaData.version,
        attributes: schemaData.attributes,
        externalReference: {
          schemaId: schemaData.externalSchemaId,
          source: 'CANdy',
          imported: true
        }
      };

      // Call Orbit Enterprise API to store external schema
      const response = await ky.post(`api/lob/${this.lobId}/schema/store`, {
        prefixUrl: this.baseURL,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        json: schemaPayload,
        timeout: 30000
      }).json<{ schemaId: number; status: string }>();

      console.log(`[CRED-MGMT] Schema import response:`, response);

      return {
        orbitSchemaId: response.schemaId,
        status: response.status === 'created' ? 'imported' : 'existing'
      };
    } catch (error) {
      console.error('[CRED-MGMT] Schema import failed:', error);
      throw new Error(`Failed to import schema into Orbit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importExternalCredentialDefinition(credDefData: ExternalCredentialDefinitionImport): Promise<CredentialDefinitionImportResult> {
    try {
      console.log(`[CRED-MGMT] Importing external credential definition: ${credDefData.externalCredDefId}`);
      
      // Prepare credential definition payload for Orbit API
      const credDefPayload = {
        schemaId: credDefData.orbitSchemaId,
        tag: credDefData.tag,
        issuerDid: credDefData.issuerDid,
        externalReference: {
          credDefId: credDefData.externalCredDefId,
          source: 'CANdy',
          imported: true
        }
      };

      // Call Orbit Enterprise API to store external credential definition
      const response = await ky.post(`api/lob/${this.lobId}/cred-def/store`, {
        prefixUrl: this.baseURL,
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        json: credDefPayload,
        timeout: 30000
      }).json<{ credDefId: number; status: string }>();

      console.log(`[CRED-MGMT] Credential definition import response:`, response);

      return {
        orbitCredDefId: response.credDefId,
        status: response.status === 'created' ? 'imported' : 'existing'
      };
    } catch (error) {
      console.error('[CRED-MGMT] Credential definition import failed:', error);
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