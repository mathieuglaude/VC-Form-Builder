import { describe, it, expect } from 'vitest';
import { extractMappings, buildDefineProofPayload, type VCMapping } from '../packages/shared/src/mapping';

describe('Mapping Extractor', () => {
  it('should extract one mapping from minimal form JSON', () => {
    const minimalForm = {
      formSchema: {
        components: [
          {
            key: 'textfield_birthdate',
            type: 'textfield',
            label: 'Birth Date',
            properties: {
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          }
        ]
      }
    };

    const mappings = extractMappings(minimalForm);
    
    expect(mappings).toHaveLength(1);
    expect(mappings[0]).toEqual({
      credentialType: 'Unverified Person',
      attributeName: 'birthdate_dateint',
      mode: 'required'
    });
  });

  it('should build define proof payload with correct attribute name', () => {
    const mappings: VCMapping[] = [
      {
        credentialType: 'Unverified Person',
        attributeName: 'birthdate_dateint',
        mode: 'required'
      }
    ];

    const payload = buildDefineProofPayload('Test Form', mappings);
    
    expect(payload.requestedAttributes).toHaveLength(1);
    expect(payload.requestedAttributes[0].attributes).toContain('birthdate_dateint');
    expect(payload.proofName).toBe('Test Form proof');
    expect(payload.proofCredFormat).toBe('ANONCREDS');
  });

  it('should handle forms with no VC mappings', () => {
    const formWithoutMappings = {
      formSchema: {
        components: [
          {
            key: 'regular_field',
            type: 'textfield',
            label: 'Regular Field'
          }
        ]
      }
    };

    const mappings = extractMappings(formWithoutMappings);
    expect(mappings).toHaveLength(0);
  });

  it('should handle forms with invalid schema structure', () => {
    const invalidForm = {};
    const mappings = extractMappings(invalidForm);
    expect(mappings).toHaveLength(0);
  });

  it('should set mode to optional by default', () => {
    const formWithOptionalMapping = {
      formSchema: {
        components: [
          {
            key: 'optional_field',
            type: 'textfield',
            properties: {
              vcMapping: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name'
              }
              // credentialMode not specified
            }
          }
        ]
      }
    };

    const mappings = extractMappings(formWithOptionalMapping);
    
    expect(mappings).toHaveLength(1);
    expect(mappings[0].mode).toBe('optional');
  });
});