import { lob } from '../src/deps/orbit';

(async () => {
  try {
    const res = await lob.register({
      lobDisplayName: 'VC Form Builder QA',
      lobEmail: 'noreply@vc-forms.example',
      lobOrganizationName: 'VC Form Builder Inc.',
      lobRole: ['VERIFIER', 'ISSUER'],
      lobTenancy: 'SINGLE',
      didMethod: 'did:sov',
      lobProtocol: 'AIP2_0',
      writeLedgerId: 1,
      credentialFormat: 'ANONCRED',
      lobTrustUrl: 'https://iata-api.trustregistry.nborbit.io',
      lobTrustAPIKey: 'DUMMY-PLACEHOLDER-KEY',
      lobExternalEndorser: false
    });
    
    console.log('Registration successful:', JSON.stringify(res, null, 2));
  } catch (error: any) {
    if (error.response) {
      const errorText = await error.response.text();
      console.error('API Error Response:', errorText);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
})();