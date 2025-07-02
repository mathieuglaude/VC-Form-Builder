import { describe, it, expect } from 'vitest';

describe('Mapping Imports', () => {
  it('should be able to import mapping utilities from shared package (API style)', async () => {
    const { extractMappings, buildDefineProofPayload } = await import('../packages/shared/src/mapping.js');
    
    expect(typeof extractMappings).toBe('function');
    expect(typeof buildDefineProofPayload).toBe('function');
  });

  it('should be able to import from shared index (web style)', async () => {
    const { extractMappings, buildDefineProofPayload } = await import('../packages/shared/src/index.js');
    
    expect(typeof extractMappings).toBe('function');
    expect(typeof buildDefineProofPayload).toBe('function');
  });
});