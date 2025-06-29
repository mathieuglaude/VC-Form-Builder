import { storage } from './storage';
import { downloadAsset } from './ocaAssets';

async function seedLSBCCredential() {
  console.log('Fetching BC Lawyer Credential OCA bundle...');
  
  try {
    const bundleUrl = 'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test/OCABundle.json';
    const response = await fetch(bundleUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OCA bundle: ${response.statusText}`);
    }
    
    const bundleArray = await response.json();
    const bundle = bundleArray[0]; // OCA bundle is wrapped in an array
    
    const brandingOverlay = bundle.overlays.find((o: any) => o.type === 'aries/overlays/branding/1.0');
    const cardOverlay = bundle.overlays.find((o: any) => o.type === 'spec/overlays/card/1.0');
    const metaOverlay = bundle.overlays.find((o: any) => o.type === 'spec/overlays/meta/1.0');
    
    console.log('Found overlays:', {
      branding: !!brandingOverlay,
      card: !!cardOverlay,
      meta: !!metaOverlay
    });
    
    let logoUrl = null;
    let bannerUrl = null;
    
    // Download assets if they exist in the branding overlay
    if (brandingOverlay) {
      if (brandingOverlay.logo) {
        console.log('Downloading logo:', brandingOverlay.logo);
        logoUrl = await downloadAsset(brandingOverlay.logo);
      }
      if (brandingOverlay.background_image) {
        console.log('Downloading background:', brandingOverlay.background_image);
        bannerUrl = await downloadAsset(brandingOverlay.background_image);
      }
    }
    
    // Update the BC Lawyer Credential with real OCA data
    const updated = await storage.updateCredentialTemplate(3, {
      branding: {
        logoUrl,
        backgroundImage: bannerUrl,
        primaryColor: brandingOverlay?.primary_background_color || '#00698c',
        layout: cardOverlay?.layout || 'banner-bottom'
      },
      metaOverlay: {
        issuer: metaOverlay?.issuer || 'Law Society of British Columbia (LSBC)',
        description: metaOverlay?.description || 'Official digital credential for licensed lawyers in British Columbia'
      }
    });
    
    if (updated) {
      console.log('✅ LSBC credential updated with real OCA assets');
      console.log('Logo URL:', logoUrl);
      console.log('Banner URL:', bannerUrl);
    } else {
      console.log('❌ Failed to update credential');
    }
    
  } catch (error) {
    console.error('Failed to seed LSBC credential:', error);
  }
}

// Run the seed function
seedLSBCCredential();