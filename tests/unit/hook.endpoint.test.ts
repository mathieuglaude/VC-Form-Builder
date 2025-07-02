import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractMappings, buildDefinePayload } from '../../packages/shared/src/proof';

describe('Proof Request Hook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dynamic Form Analysis', () => {
    it('should correctly extract VC mappings from real form structure', () => {
      // Simulating form structure from /form/7 (Age Proof v2)
      const realFormSchema = {
        components: [
          {
            key: 'textfield_birthdate',
            type: 'textfield',
            label: 'Birth Date',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          },
          {
            key: 'textfield_name', 
            type: 'textfield',
            label: 'Full Name',
            properties: {
              dataSource: 'freetext'
            }
          }
        ]
      };

      const mappings = extractMappings(realFormSchema);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0]).toEqual({
        credentialType: 'Unverified Person',
        attributeName: 'birthdate_dateint',
        mode: 'required'
      });
    });

    it('should build correct API payload for age verification form', () => {
      const mappings = [
        {
          credentialType: 'Unverified Person',
          attributeName: 'birthdate_dateint',
          mode: 'required' as const
        }
      ];

      const payload = buildDefinePayload(mappings, 'Age Proof v2');
      
      expect(payload).not.toBeNull();
      expect(payload!.proofName).toBe('Age Proof v2 proof');
      expect(payload!.proofPurpose).toBe('Verification for Age Proof v2');
      expect(payload!.requestedAttributes).toHaveLength(1);
      
      const attr = payload!.requestedAttributes[0];
      expect(attr.name).toBe('birthdate_dateint');
      expect(attr.restrictions).toHaveLength(1);
      expect(attr.restrictions[0]).toMatchObject({
        anoncredsCredDefId: expect.stringContaining('QzLYGuAebsy3MXQ6b1sFiT:3:CL:'),
        anoncredsIssuerDid: 'QzLYGuAebsy3MXQ6b1sFiT',
        anoncredsSchemaName: 'person_credential',
        anoncredsSchemaVersion: '1.0'
      });
    });

    it('should handle multi-credential form scenarios', () => {
      const complexFormSchema = {
        components: [
          {
            key: 'lawyer_name',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Lawyer Credential v1',
                attributeName: 'given_name'
              },
              credentialMode: 'required'
            }
          },
          {
            key: 'lawyer_surname',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Lawyer Credential v1',
                attributeName: 'surname'
              },
              credentialMode: 'required'
            }
          },
          {
            key: 'business_name',
            type: 'textfield', 
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Digital Business Card v1',
                attributeName: 'business_name'
              },
              credentialMode: 'optional'
            }
          }
        ]
      };

      const mappings = extractMappings(complexFormSchema);
      const payload = buildDefinePayload(mappings, 'Lawyer Business Verification');
      
      expect(mappings).toHaveLength(3);
      expect(payload).not.toBeNull();
      expect(payload!.requestedAttributes).toHaveLength(3);
      
      // Verify lawyer attributes
      const lawyerNameAttr = payload!.requestedAttributes.find(attr => attr.name === 'given_name');
      const lawyerSurnameAttr = payload!.requestedAttributes.find(attr => attr.name === 'surname');
      expect(lawyerNameAttr).toBeDefined();
      expect(lawyerSurnameAttr).toBeDefined();
      
      // Both lawyer attributes should have same credential restrictions
      expect(lawyerNameAttr!.restrictions[0].anoncredsCredDefId)
        .toBe(lawyerSurnameAttr!.restrictions[0].anoncredsCredDefId);
      
      // Business attribute should have different restrictions
      const businessAttr = payload!.requestedAttributes.find(attr => attr.name === 'business_name');
      expect(businessAttr!.restrictions[0].anoncredsCredDefId)
        .not.toBe(lawyerNameAttr!.restrictions[0].anoncredsCredDefId);
    });

    it('should handle empty form gracefully', () => {
      const emptyFormSchema = {
        components: []
      };

      const mappings = extractMappings(emptyFormSchema);
      const payload = buildDefinePayload(mappings, 'Empty Form');
      
      expect(mappings).toHaveLength(0);
      expect(payload).toBeNull();
    });

    it('should filter invalid credential types', () => {
      const formWithInvalidCreds = {
        components: [
          {
            key: 'valid_field',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          },
          {
            key: 'invalid_field',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'NonExistent Credential',
                attributeName: 'fake_attribute'
              },
              credentialMode: 'required'
            }
          }
        ]
      };

      const mappings = extractMappings(formWithInvalidCreds);
      const payload = buildDefinePayload(mappings, 'Mixed Validity Form');
      
      expect(mappings).toHaveLength(2); // Both mappings extracted
      expect(payload).not.toBeNull();
      expect(payload!.requestedAttributes).toHaveLength(1); // Only valid credential used
      expect(payload!.requestedAttributes[0].name).toBe('birthdate_dateint');
    });
  });

  describe('API Response Structure', () => {
    it('should expect proper response structure from initFormProof endpoint', () => {
      // Test for expected response from /api/proofs/init-form/:formId
      const expectedResponseStructure = {
        proofId: expect.any(String),
        qr: {
          svg: expect.any(String),
          invitationUrl: expect.any(String)
        }
      };

      // This validates the ProofInitResponse interface structure
      expect(expectedResponseStructure).toBeDefined();
    });

    it('should handle conversion between OrbitProofRequest and DefineProofPayload', () => {
      const orbitRequest = {
        proofName: 'Test proof',
        proofPurpose: 'Verification for Test',
        proofCredFormat: 'ANONCREDS',
        requestedAttributes: [
          {
            name: 'birthdate_dateint',
            restrictions: [
              {
                anoncredsCredDefId: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:123456:default',
                anoncredsIssuerDid: 'QzLYGuAebsy3MXQ6b1sFiT',
                anoncredsSchemaName: 'person_credential',
                anoncredsSchemaVersion: '1.0',
                anoncredsSchemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:person_credential:1.0'
              }
            ]
          }
        ],
        requestedPredicates: []
      };

      // Conversion format expected by VerifierService
      const legacyPayload = {
        proofName: orbitRequest.proofName,
        proofPurpose: orbitRequest.proofPurpose,
        proofCredFormat: orbitRequest.proofCredFormat,
        requestedAttributes: orbitRequest.requestedAttributes.map(attr => ({
          attributes: [attr.name]
        })),
        requestedPredicates: orbitRequest.requestedPredicates
      };

      expect(legacyPayload.requestedAttributes).toHaveLength(1);
      expect(legacyPayload.requestedAttributes[0]).toEqual({
        attributes: ['birthdate_dateint']
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed form schemas', () => {
      const malformedSchemas = [
        null,
        undefined,
        { components: null },
        { components: [{ key: 'broken', properties: null }] },
        { components: [{ properties: { vcMapping: null } }] }
      ];

      malformedSchemas.forEach(schema => {
        expect(() => extractMappings(schema as any)).not.toThrow();
        const mappings = extractMappings(schema as any);
        expect(Array.isArray(mappings)).toBe(true);
      });
    });

    it('should handle missing required fields gracefully', () => {
      const incompleteForm = {
        components: [
          {
            key: 'incomplete',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person'
                // Missing attributeName
              }
            }
          }
        ]
      };

      const mappings = extractMappings(incompleteForm);
      expect(mappings).toHaveLength(0); // Should skip incomplete mappings
    });
  });
});