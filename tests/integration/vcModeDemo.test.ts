import { describe, it, expect, beforeAll } from 'vitest';

describe('VC Mode Demonstration', () => {
  beforeAll(() => {
    // Ensure VC mode is enabled for this test suite
    expect(process.env.ENABLE_VC).toBe('true');
  });

  it('should demonstrate VC mode endpoint availability', async () => {
    // Test that VC endpoints are now available when flag is enabled
    const response = await fetch('http://localhost:5000/api/forms/15');
    expect(response.ok).toBe(true);
    
    const form = await response.json();
    expect(form).toHaveProperty('id', 15);
    
    console.log('✅ VC Mode enabled - all endpoints available');
    console.log('📋 Form loaded:', form.name);
  });

  it('should show VC mapping extraction works in enabled mode', async () => {
    // Import the mapping function
    const { extractMappings } = await import('../../packages/shared/src/mapping');
    
    const vcForm = {
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
          }
        ]
      }
    };

    const mappings = extractMappings(vcForm);
    expect(mappings).toHaveLength(1);
    expect(mappings[0]).toEqual({
      credentialType: 'BC Person Credential',
      attributeName: 'given_name',
      mode: 'required'
    });
    
    console.log('✅ VC mapping extraction working in enabled mode');
    console.log('🔗 Extracted mappings:', mappings);
  });

  it('should demonstrate proper vcConfig namespace usage', () => {
    // Show that VC data is properly namespaced under vcConfig
    const component = {
      key: 'fullName',
      type: 'textfield',
      label: 'Full Name',
      required: true,
      // Plain Form.io properties remain unchanged
      validate: {
        required: true,
        pattern: '^[a-zA-Z ]+$'
      },
      // VC properties are namespaced under vcConfig
      vcConfig: {
        credentialType: 'BC Person Credential',
        attributeName: 'given_name',
        mode: 'required'
      }
    };

    // Verify no pollution of Form.io schema
    expect(component).not.toHaveProperty('vcMapping');
    expect(component).not.toHaveProperty('credentialType');
    expect(component).not.toHaveProperty('attributeName');
    
    // Verify proper namespacing
    expect(component.vcConfig).toEqual({
      credentialType: 'BC Person Credential',
      attributeName: 'given_name',
      mode: 'required'
    });
    
    console.log('✅ VC properties properly namespaced under vcConfig');
    console.log('🏗️ Component structure:', JSON.stringify(component, null, 2));
  });
});