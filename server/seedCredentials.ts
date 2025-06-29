import { cacheAsset } from './ocaAssets';
import { storage } from './storage';

export async function seedLSBCCredentialWithAssets() {
  console.log('Seeding BC Lawyer Credential with cached OCA assets...');
  
  try {
    const baseRaw = 'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test/overlays/branding';
    
    // Download and cache assets locally
    const logoLocal = await cacheAsset(`${baseRaw}/logo.png`, 'logo.png');
    const bannerLocal = await cacheAsset(`${baseRaw}/background_image.png`, 'banner.png');
    
    console.log('Cached logo to:', logoLocal);
    console.log('Cached banner to:', bannerLocal);
    
    // Update the BC Lawyer Credential with local asset paths
    const existingCredential = await storage.getCredentialTemplate(3); // BC Lawyer Credential ID
    
    if (existingCredential) {
      await storage.updateCredentialTemplate(3, {
        branding: {
          logoUrl: logoLocal,
          backgroundImage: bannerLocal,
          primaryColor: '#00698c',
          layout: 'banner-bottom'
        },
        metaOverlay: {
          issuer: 'Law Society of British Columbia (LSBC)',
          description: 'Official digital credential for licensed lawyers in British Columbia'
        }
      });
      
      console.log('✓ BC Lawyer Credential updated with local assets');
    } else {
      console.log('BC Lawyer Credential not found');
    }
    
  } catch (error) {
    console.error('Failed to seed LSBC credential:', error);
  }
}

// Run if called directly
seedLSBCCredentialWithAssets();