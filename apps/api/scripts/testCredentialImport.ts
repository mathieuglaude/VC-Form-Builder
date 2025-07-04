#!/usr/bin/env tsx
import { CredentialManagementService } from '../../../packages/external/orbit/CredentialManagementService.js';

const ORBIT_API_KEY = process.env.ORBIT_API_KEY;
const ORBIT_LOB_ID = process.env.ORBIT_LOB_ID;

if (!ORBIT_API_KEY || !ORBIT_LOB_ID) {
  console.error('Missing required environment variables');
  console.log('ORBIT_API_KEY present:', !!ORBIT_API_KEY);
  console.log('ORBIT_LOB_ID present:', !!ORBIT_LOB_ID);
  process.exit(1);
}

/**
 * Test script to demonstrate credential import functionality
 * This shows how external BC Government credentials can be imported into Orbit
 */
async function testCredentialImport() {
  console.log('\n=== Testing Credential Import into Orbit ===\n');

  try {
    const credMgmtService = new CredentialManagementService(ORBIT_API_KEY!, ORBIT_LOB_ID!);

    // Test importing BC Person Credential schema and credential definition
    const testCredential = {
      label: 'BC Person Credential v1',
      externalSchemaId: 'RGjWbW1eycP7FrMf4QJvX8:2:Person:1.0',
      externalCredDefId: 'RGjWbW1eycP7FrMf4QJvX8:3:CL:13:Person_v1',
      issuerDid: 'did:indy:candy:RGjWbW1eycP7FrMf4QJvX8'
    };

    console.log(`Testing import of: ${testCredential.label}`);
    console.log(`External Schema ID: ${testCredential.externalSchemaId}`);
    console.log(`External CredDef ID: ${testCredential.externalCredDefId}`);
    console.log('');

    // Step 1: Import the schema
    console.log('Step 1: Importing external schema...');
    const schemaResult = await credMgmtService.importExternalSchema(testCredential.externalSchemaId);
    console.log('Schema import result:', schemaResult);

    if (schemaResult.success) {
      console.log(`✓ Schema imported successfully with Orbit ID: ${schemaResult.orbitSchemaId}`);
    } else {
      console.error(`✗ Schema import failed: ${schemaResult.error}`);
      return;
    }

    // Step 2: Import the credential definition
    console.log('\nStep 2: Importing external credential definition...');
    const credDefResult = await credMgmtService.importExternalCredentialDefinition(
      testCredential.externalCredDefId,
      schemaResult.orbitSchemaId
    );
    console.log('CredDef import result:', credDefResult);

    if (credDefResult.success) {
      console.log(`✓ CredDef imported successfully with Orbit ID: ${credDefResult.orbitCredDefId}`);
    } else {
      console.error(`✗ CredDef import failed: ${credDefResult.error}`);
      return;
    }

    // Step 3: Show how these IDs would be used in proof requests
    console.log('\n=== Import Complete ===');
    console.log('Orbit mappings for proof requests:');
    console.log(`- Orbit Schema ID: ${schemaResult.orbitSchemaId}`);
    console.log(`- Orbit CredDef ID: ${credDefResult.orbitCredDefId}`);
    console.log('\nThese numeric IDs can now be used in direct proof-request/url calls');
    console.log('instead of external AnonCreds identifiers.');

  } catch (error) {
    console.error('Test failed with error:', error);
    
    if (error instanceof Error && error.message.includes('fetch')) {
      console.log('\nTroubleshooting:');
      console.log('- Check that ORBIT_API_KEY is valid and has correct permissions');
      console.log('- Verify ORBIT_LOB_ID exists and is accessible');
      console.log('- Ensure credential management API is available at testapi-credential.nborbit.ca');
    }
  }
}

// Run the test
testCredentialImport().catch(console.error);