import { describe, it, expect } from 'vitest';
import { extractMappings } from '../../packages/shared/src/mapping';

describe('extractMappings', () => {
  it('pulls birthdate_dateint from sample form', async () => {
    const form = await import('../fixtures/form_birthdate.json');
    const mappings = extractMappings(form.default);
    expect(mappings[0]?.attributeName).toBe('birthdate_dateint');
    expect(mappings[0]?.credentialType).toBe('Unverified Person');
    expect(mappings[0]?.mode).toBe('required');
  });

  it('handles forms with multiple VC mappings', () => {
    const form = {
      formSchema: {
        components: [
          {
            key: 'firstName',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name'
              },
              credentialMode: 'optional'
            }
          },
          {
            key: 'lastName',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Person Credential',
                attributeName: 'family_name'
              },
              credentialMode: 'required'
            }
          },
          {
            key: 'email',
            properties: {
              dataSource: 'manual'
            }
          }
        ]
      }
    };

    const mappings = extractMappings(form);
    expect(mappings).toHaveLength(2);
    expect(mappings[0]).toEqual({
      credentialType: 'BC Person Credential',
      attributeName: 'given_name',
      mode: 'optional'
    });
    expect(mappings[1]).toEqual({
      credentialType: 'BC Person Credential',
      attributeName: 'family_name',
      mode: 'required'
    });
  });

  it('returns empty array for forms with no VC mappings', () => {
    const form = {
      formSchema: {
        components: [
          {
            key: 'textField',
            properties: {
              dataSource: 'manual'
            }
          }
        ]
      }
    };

    const mappings = extractMappings(form);
    expect(mappings).toEqual([]);
  });
});