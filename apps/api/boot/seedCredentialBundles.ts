import { importOCABundle } from '../../../packages/external/oca/importBundle';

const bundles = [
  'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/LSBC/Lawyer/Test/OCABundle.json',
  'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/Person/Prod/OCABundle.json',
  'https://raw.githubusercontent.com/bcgov/aries-oca-bundles/main/OCABundles/schema/bcgov-digital-trust/DigitalBusinessCard/Prod/OCABundle.json'
];

export default async function seedCredentialBundles() {
  console.log('🌱 Seeding credential bundles from OCA repositories...');
  
  for (const url of bundles) {
    try {
      const result = await importOCABundle(url);
      console.log(`✅ Imported: ${result.label} v${result.version}`);
    } catch (error) {
      console.warn(`⚠️  Failed to import bundle from ${url}:`, error);
    }
  }
  
  console.log('✅ Generic credential templates seeded');
}