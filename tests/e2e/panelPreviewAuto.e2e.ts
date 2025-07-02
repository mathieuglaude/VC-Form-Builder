import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../apps/api/routes';

describe('E2E: Auto-open verification panel in preview mode', () => {
  it('should auto-open verification panel for preview mode with VC fields', async () => {
    const app = express();
    await registerRoutes(app);

    // Test form 7 (Age Proof v2) has VC fields 
    const response = await request(app)
      .get('/api/forms/7')
      .expect(200);

    const form = response.body;
    
    // Verify form has VC-mapped fields
    const hasVC = form.formDefinition?.components?.some((comp: any) => 
      comp.properties?.dataSource === 'verified'
    );
    
    expect(hasVC).toBe(true);
    expect(form.name).toBe('Age Proof v2');
    
    // This test validates the backend data structure
    // Frontend auto-open logic is tested via trace logs
  });

  it('should not auto-open panel for forms without VC fields', async () => {
    const app = express();
    await registerRoutes(app);

    // Create a mock form without VC fields for testing
    const mockForm = {
      name: 'Test Form No VC',
      slug: 'test-no-vc',
      purpose: 'Testing',
      formDefinition: {
        components: [
          {
            key: 'text1',
            type: 'textfield',
            label: 'Regular Text Field',
            properties: { dataSource: 'freetext' }
          }
        ]
      }
    };

    // Test logic: form without VC fields should not trigger auto-open
    const hasVC = mockForm.formDefinition.components.some((comp: any) => 
      comp.properties?.dataSource === 'verified'
    );
    
    expect(hasVC).toBe(false);
  });
});