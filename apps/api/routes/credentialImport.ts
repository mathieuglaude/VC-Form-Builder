import { Request, Response } from 'express';
// import { CredentialImportService } from '../src/services/credentialImportService.js';
import { storage } from '../storage.js';

/**
 * API endpoint to test credential import functionality
 * This demonstrates how external credentials can be imported into Orbit
 */
export async function testImportCredential(req: Request, res: Response) {
  try {
    const { credentialType } = req.body;
    
    if (!credentialType) {
      return res.status(400).json({ error: 'credentialType required' });
    }

    // Find the credential template in our database
    const credTemplates = await storage.listCredentialTemplates();
    const credTemplate = credTemplates.find((t: any) => t.label === credentialType);
    
    if (!credTemplate) {
      return res.status(404).json({ error: 'Credential template not found' });
    }

    // Simulate the credential import process
    console.log(`[IMPORT-DEMO] Would import credential: ${credentialType}`);
    console.log(`[IMPORT-DEMO] Schema ID: ${credTemplate.schemaId}`);
    console.log(`[IMPORT-DEMO] CredDef ID: ${credTemplate.credDefId}`);
    console.log(`[IMPORT-DEMO] Target: testapi-credential.nborbit.ca API`);
    
    // Demonstrate how numeric IDs would be returned after import
    const mockOrbitMapping = {
      orbitSchemaId: Math.floor(Math.random() * 1000) + 100, // Mock numeric ID
      orbitCredDefId: Math.floor(Math.random() * 1000) + 200, // Mock numeric ID
      externalSchemaId: credTemplate.schemaId,
      externalCredDefId: credTemplate.credDefId
    };
    
    res.json({
      success: true,
      credentialType,
      orbitMapping: mockOrbitMapping,
      message: 'Credential import workflow demonstrated (would use real Orbit API in production)',
      implementation: {
        step1: 'POST /api/lob/{lob_id}/schema/store - Import external schema',
        step2: 'POST /api/lob/{lob_id}/cred-def/store - Import external credential definition',
        step3: 'Store numeric IDs in database for future proof requests',
        step4: 'Use numeric IDs instead of external AnonCreds identifiers'
      }
    });

  } catch (error) {
    console.error('[IMPORT-DEMO] Error:', error);
    res.status(500).json({ 
      error: 'Import demo failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * API endpoint to show current Orbit mappings for a credential
 */
export async function getOrbitMapping(req: Request, res: Response) {
  try {
    const { credentialType } = req.params;
    
    // Find the credential template in our database
    const credTemplates = await storage.listCredentialTemplates();
    const credTemplate = credTemplates.find((t: any) => t.label === credentialType);
    
    if (!credTemplate) {
      return res.status(404).json({ error: 'Credential template not found' });
    }

    // Show what the mapping process would produce
    res.json({
      credentialType,
      externalIdentifiers: {
        schemaId: credTemplate.schemaId,
        credDefId: credTemplate.credDefId,
        issuerDid: credTemplate.issuerDid
      },
      orbitMapping: {
        status: 'would-be-imported',
        process: 'External credentials need to be imported via Orbit API first',
        endpoints: {
          importSchema: 'POST /api/lob/{lob_id}/schema/store',
          importCredDef: 'POST /api/lob/{lob_id}/cred-def/store'
        }
      },
      nextSteps: [
        'Import external schema into Orbit LOB',
        'Import external credential definition',
        'Store returned numeric IDs in database',
        'Use numeric IDs in proof requests'
      ]
    });

  } catch (error) {
    console.error('[MAPPING-CHECK] Error:', error);
    res.status(500).json({ 
      error: 'Mapping check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}