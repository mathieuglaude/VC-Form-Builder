import { storage } from './storage';
import { downloadAsset } from './ocaAssets';

export async function ensureLawyerCred() {
  try {
    // Check if BC Lawyer Credential exists
    const templates = await storage.listCredentialTemplates();
    const lawyerCred = templates.find(t => t.label === 'BC Lawyer Credential v1');
    
    if (lawyerCred) {
      console.log('✓ BC Lawyer Credential already exists');
      return;
    }

    console.log('🔄 Re-seeding BC Lawyer Credential...');
    
    // Download OCA assets
    const baseUrl = 'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test/overlays/branding';
    const logoUrl = await downloadAsset(`${baseUrl}/logo.png`);
    const bannerUrl = await downloadAsset(`${baseUrl}/background_image.png`);
    
    // Create the credential with branding
    await storage.createCredentialTemplate({
      label: 'BC Lawyer Credential v1',
      version: '1.0',
      schemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0',
      credDefId: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer',
      issuerDid: 'did:indy:QzLYGuAebsy3MXQ6b1sFiT',
      schemaUrl: 'https://bcgov.github.io/digital-trust-toolkit/docs/governance/justice/legal-professional/governance',
      attributes: [
        { name: 'given_name', description: 'Legal given name(s)' },
        { name: 'surname', description: 'Legal surname' },
        { name: 'public_person_id', description: 'Unique LSBC Public Person ID (PPID)' },
        { name: 'member_status', description: 'Current membership status (e.g., PRAC)' },
        { name: 'member_status_code', description: 'Code for membership status' },
        { name: 'credential_type', description: 'Credential type (Lawyer)' }
      ],
      isPredefined: true,
      ecosystem: 'BC Ecosystem',
      interopProfile: 'AIP 2.0',
      compatibleWallets: ['BC Wallet'],
      walletRestricted: true,
      branding: {
        layout: 'banner-bottom',
        logoUrl,
        backgroundImage: bannerUrl,
        primaryColor: '#00698c'
      },
      metaOverlay: {
        issuer: 'Law Society of British Columbia (LSBC)',
        description: 'Official digital credential for licensed lawyers in British Columbia'
      }
    });
    
    console.log('✅ BC Lawyer Credential re-seeded successfully');
    
  } catch (error) {
    console.error('Failed to ensure BC Lawyer Credential:', error);
  }
}