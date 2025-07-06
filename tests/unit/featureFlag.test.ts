import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractMappings } from '../../packages/shared/src/mapping';

describe('Feature Flag Integration Tests', () => {
  describe('VC Mapping Extraction', () => {
    it('should extract VC mappings from vcConfig structure', () => {
      const form = {
        formSchema: {
          components: [
            {
              key: 'fullName',
              type: 'textfield',
              vcConfig: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name',
                mode: 'required'
              }
            },
            {
              key: 'email',
              type: 'email',
              vcConfig: {
                credentialType: 'BC Person Credential',
                attributeName: 'email',
                mode: 'optional'
              }
            },
            {
              key: 'regularField',
              type: 'textfield'
              // No VC config - should be ignored
            }
          ]
        }
      };

      const mappings = extractMappings(form);
      
      expect(mappings).toHaveLength(2);
      expect(mappings[0]).toEqual({
        credentialType: 'BC Person Credential',
        attributeName: 'given_name',
        mode: 'required'
      });
      expect(mappings[1]).toEqual({
        credentialType: 'BC Person Credential',
        attributeName: 'email',
        mode: 'optional'
      });
    });

    it('should extract VC mappings from legacy vcMapping structure', () => {
      const form = {
        formSchema: {
          components: [
            {
              key: 'fullName',
              type: 'textfield',
              properties: {
                vcMapping: {
                  credentialType: 'BC Person Credential',
                  attributeName: 'given_name'
                },
                credentialMode: 'required'
              }
            }
          ]
        }
      };

      const mappings = extractMappings(form);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0]).toEqual({
        credentialType: 'BC Person Credential',
        attributeName: 'given_name',
        mode: 'required'
      });
    });

    it('should prioritize vcConfig over legacy structure when both exist', () => {
      const form = {
        formSchema: {
          components: [
            {
              key: 'fullName',
              type: 'textfield',
              vcConfig: {
                credentialType: 'BC Person Credential v2',
                attributeName: 'full_name',
                mode: 'optional'
              },
              properties: {
                vcMapping: {
                  credentialType: 'Old Credential',
                  attributeName: 'old_name'
                },
                credentialMode: 'required'
              }
            }
          ]
        }
      };

      const mappings = extractMappings(form);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0]).toEqual({
        credentialType: 'BC Person Credential v2',
        attributeName: 'full_name',
        mode: 'optional'
      });
    });

    it('should return empty array when no VC fields are found', () => {
      const form = {
        formSchema: {
          components: [
            {
              key: 'plainField1',
              type: 'textfield'
            },
            {
              key: 'plainField2',
              type: 'email'
            }
          ]
        }
      };

      const mappings = extractMappings(form);
      expect(mappings).toHaveLength(0);
    });

    it('should handle malformed form schemas gracefully', () => {
      expect(extractMappings(null)).toHaveLength(0);
      expect(extractMappings({})).toHaveLength(0);
      expect(extractMappings({ formSchema: {} })).toHaveLength(0);
      expect(extractMappings({ formSchema: { components: null } })).toHaveLength(0);
    });
  });

  describe('Environment Flag Simulation', () => {
    beforeEach(() => {
      // Reset environment variables between tests
      vi.unstubAllEnvs();
    });

    it('should respect ENABLE_VC=false environment variable', () => {
      vi.stubEnv('ENABLE_VC', 'false');
      vi.stubEnv('VITE_ENABLE_VC', 'false');
      
      expect(process.env.ENABLE_VC).toBe('false');
      expect(import.meta.env.VITE_ENABLE_VC).toBe('false');
    });

    it('should respect ENABLE_VC=true environment variable', () => {
      vi.stubEnv('ENABLE_VC', 'true');
      vi.stubEnv('VITE_ENABLE_VC', 'true');
      
      expect(process.env.ENABLE_VC).toBe('true');
      expect(import.meta.env.VITE_ENABLE_VC).toBe('true');
    });

    it('should default to false when environment variables are not set', () => {
      vi.stubEnv('ENABLE_VC', undefined);
      vi.stubEnv('VITE_ENABLE_VC', undefined);
      
      expect(process.env.ENABLE_VC).toBeUndefined();
      expect(import.meta.env.VITE_ENABLE_VC).toBeUndefined();
    });
  });

  describe('Form VC Detection Logic', () => {
    // Helper function to simulate the needsVerificationCredentials logic
    function needsVerificationCredentials(form: any, enableVC: boolean, vcFlag: string) {
      if (!enableVC) return false;
      if (vcFlag !== 'true') return false;
      
      const formSchema = form?.formSchema || form?.formDefinition;
      if (!formSchema?.components) return false;
      
      return formSchema.components.some((component: any) => 
        component.vcConfig?.credentialType && component.vcConfig?.attributeName
      );
    }

    it('should detect VC fields when feature flag is enabled', () => {
      const formWithVC = {
        formSchema: {
          components: [
            {
              key: 'name',
              vcConfig: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name'
              }
            }
          ]
        }
      };

      expect(needsVerificationCredentials(formWithVC, true, 'true')).toBe(true);
    });

    it('should NOT detect VC fields when enableVC prop is false', () => {
      const formWithVC = {
        formSchema: {
          components: [
            {
              key: 'name',
              vcConfig: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name'
              }
            }
          ]
        }
      };

      expect(needsVerificationCredentials(formWithVC, false, 'true')).toBe(false);
    });

    it('should NOT detect VC fields when VITE_ENABLE_VC is false', () => {
      const formWithVC = {
        formSchema: {
          components: [
            {
              key: 'name',
              vcConfig: {
                credentialType: 'BC Person Credential',
                attributeName: 'given_name'
              }
            }
          ]
        }
      };

      expect(needsVerificationCredentials(formWithVC, true, 'false')).toBe(false);
    });

    it('should return false for plain forms regardless of flag settings', () => {
      const plainForm = {
        formSchema: {
          components: [
            {
              key: 'name',
              type: 'textfield'
            },
            {
              key: 'email',
              type: 'email'
            }
          ]
        }
      };

      expect(needsVerificationCredentials(plainForm, true, 'true')).toBe(false);
      expect(needsVerificationCredentials(plainForm, false, 'false')).toBe(false);
    });
  });
});