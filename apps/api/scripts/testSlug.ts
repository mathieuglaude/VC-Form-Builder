import { storage } from '../storage';

(async () => {
  try {
    console.log('Testing slug availability...');
    
    // Test with a slug that should be available
    const uniqueSlug = 'zzz-test-' + Date.now();
    const available = await storage.checkPublicSlugAvailability(uniqueSlug);
    console.log(`Unique slug "${uniqueSlug}" available:`, available);
    
    // Test with an existing slug if any forms exist
    const forms = await storage.listFormConfigs();
    if (forms.length > 0 && forms[0].publicSlug) {
      const existingSlug = forms[0].publicSlug;
      const available2 = await storage.checkPublicSlugAvailability(existingSlug);
      console.log(`Existing slug "${existingSlug}" available:`, available2);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing slug availability:', error);
    process.exit(1);
  }
})();