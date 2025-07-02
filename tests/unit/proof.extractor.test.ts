import { describe, it, expect } from 'vitest';
import { extractMappings, buildDefinePayload, type VCMapping, type FormSchema } from '../../packages/shared/src/proof';

describe('Proof Request Utilities', () => {
  describe('extractMappings', () => {
    it('should extract single VC mapping from form schema', () => {
      const formSchema: FormSchema = {
        components: [
          {
            key: 'textfield_birthdate',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          }
        ]
      };

      const mappings = extractMappings(formSchema);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0]).toEqual({
        credentialType: 'Unverified Person',
        attributeName: 'birthdate_dateint',
        mode: 'required'
      });
    });

    it('should extract multiple VC mappings from different credential types', () => {
      const formSchema: FormSchema = {
        components: [
          {
            key: 'birthdate',
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
            key: 'lawyer_name',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'BC Lawyer Credential v1',
                attributeName: 'given_name'
              },
              credentialMode: 'optional'
            }
          }
        ]
      };

      const mappings = extractMappings(formSchema);
      
      expect(mappings).toHaveLength(2);
      expect(mappings).toContainEqual({
        credentialType: 'Unverified Person',
        attributeName: 'birthdate_dateint',
        mode: 'required'
      });
      expect(mappings).toContainEqual({
        credentialType: 'BC Lawyer Credential v1',
        attributeName: 'given_name',
        mode: 'optional'
      });
    });

    it('should ignore non-VC fields', () => {
      const formSchema: FormSchema = {
        components: [
          {
            key: 'freetext_field',
            type: 'textfield',
            properties: {
              dataSource: 'freetext'
            }
          },
          {
            key: 'verified_field',
            type: 'textfield',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          }
        ]
      };

      const mappings = extractMappings(formSchema);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0].attributeName).toBe('birthdate_dateint');
    });

    it('should return empty array for form with no VC fields', () => {
      const formSchema: FormSchema = {
        components: [
          {
            key: 'name_field',
            type: 'textfield',
            properties: {
              dataSource: 'freetext'
            }
          }
        ]
      };

      const mappings = extractMappings(formSchema);
      expect(mappings).toHaveLength(0);
    });

    it('should handle empty or invalid form schema', () => {
      expect(extractMappings({ components: [] })).toHaveLength(0);
      expect(extractMappings({ components: null as any })).toHaveLength(0);
    });
  });

  describe('buildDefinePayload', () => {
    it('should build valid Orbit proof request for single mapping', () => {
      const mappings: VCMapping[] = [
        {
          credentialType: 'Unverified Person',
          attributeName: 'birthdate_dateint',
          mode: 'required'
        }
      ];

      const payload = buildDefinePayload(mappings, 'Age Verification Form');
      
      expect(payload).not.toBeNull();
      expect(payload!.proofName).toBe('Age Verification Form proof');
      expect(payload!.proofPurpose).toBe('Verification for Age Verification Form');
      expect(payload!.proofCredFormat).toBe('ANONCREDS');
      expect(payload!.requestedAttributes).toHaveLength(1);
      expect(payload!.requestedAttributes[0]).toEqual({
        name: 'birthdate_dateint',
        restrictions: [{
          anoncredsCredDefId: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:123456:default',
          anoncredsIssuerDid: 'QzLYGuAebsy3MXQ6b1sFiT',
          anoncredsSchemaName: 'person_credential',
          anoncredsSchemaVersion: '1.0',
          anoncredsSchemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:person_credential:1.0'
        }]
      });
      expect(payload!.requestedPredicates).toHaveLength(0);
    });

    it('should build payload for multiple attributes from same credential', () => {
      const mappings: VCMapping[] = [
        {
          credentialType: 'BC Lawyer Credential v1',
          attributeName: 'given_name',
          mode: 'required'
        },
        {
          credentialType: 'BC Lawyer Credential v1',
          attributeName: 'surname',
          mode: 'required'
        }
      ];

      const payload = buildDefinePayload(mappings, 'Lawyer Verification');
      
      expect(payload).not.toBeNull();
      expect(payload!.requestedAttributes).toHaveLength(2);
      
      // Both should have same restrictions since they're from same credential
      const attr1 = payload!.requestedAttributes.find(attr => attr.name === 'given_name');
      const attr2 = payload!.requestedAttributes.find(attr => attr.name === 'surname');
      
      expect(attr1).toBeDefined();
      expect(attr2).toBeDefined();
      expect(attr1!.restrictions[0].anoncredsCredDefId).toBe(attr2!.restrictions[0].anoncredsCredDefId);
    });

    it('should build payload for mixed credential types', () => {
      const mappings: VCMapping[] = [
        {
          credentialType: 'Unverified Person',
          attributeName: 'birthdate_dateint',
          mode: 'required'
        },
        {
          credentialType: 'BC Digital Business Card v1',
          attributeName: 'business_name',
          mode: 'optional'
        }
      ];

      const payload = buildDefinePayload(mappings);
      
      expect(payload).not.toBeNull();
      expect(payload!.requestedAttributes).toHaveLength(2);
      
      const personAttr = payload!.requestedAttributes.find(attr => attr.name === 'birthdate_dateint');
      const businessAttr = payload!.requestedAttributes.find(attr => attr.name === 'business_name');
      
      expect(personAttr!.restrictions[0].anoncredsCredDefId).toBe('QzLYGuAebsy3MXQ6b1sFiT:3:CL:123456:default');
      expect(businessAttr!.restrictions[0].anoncredsCredDefId).toBe('RGjWbW1eycP7FrMf4QJvX8:3:CL:13:MYCO_Biomarker');
    });

    it('should return null for empty mappings', () => {
      const payload = buildDefinePayload([]);
      expect(payload).toBeNull();
    });

    it('should filter out unknown credential types', () => {
      const mappings: VCMapping[] = [
        {
          credentialType: 'Unknown Credential Type',
          attributeName: 'some_attribute',
          mode: 'required'
        },
        {
          credentialType: 'Unverified Person',
          attributeName: 'birthdate_dateint',
          mode: 'required'
        }
      ];

      const payload = buildDefinePayload(mappings);
      
      expect(payload).not.toBeNull();
      expect(payload!.requestedAttributes).toHaveLength(1);
      expect(payload!.requestedAttributes[0].name).toBe('birthdate_dateint');
    });

    it('should use default form name when not provided', () => {
      const mappings: VCMapping[] = [
        {
          credentialType: 'Unverified Person',
          attributeName: 'birthdate_dateint',
          mode: 'required'
        }
      ];

      const payload = buildDefinePayload(mappings);
      
      expect(payload!.proofName).toBe('Form proof');
      expect(payload!.proofPurpose).toBe('Verification for Form');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete form-to-payload workflow', () => {
      const formSchema: FormSchema = {
        components: [
          {
            key: 'age_field',
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
            key: 'name_field',
            type: 'textfield',
            properties: {
              dataSource: 'freetext'
            }
          }
        ]
      };

      const mappings = extractMappings(formSchema);
      const payload = buildDefinePayload(mappings, 'Complete Form Test');
      
      expect(mappings).toHaveLength(1);
      expect(payload).not.toBeNull();
      expect(payload!.proofName).toBe('Complete Form Test proof');
      expect(payload!.requestedAttributes).toHaveLength(1);
      expect(payload!.requestedAttributes[0].name).toBe('birthdate_dateint');
    });
  });
});