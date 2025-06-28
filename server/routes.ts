import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { vcApiService } from "./services/vcApi";
import { insertFormConfigSchema, insertFormSubmissionSchema, insertCredentialTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time VC verification
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const clientId = req.url?.split('?clientId=')[1] || `client_${Date.now()}`;
    clients.set(clientId, ws);
    
    ws.on('close', () => {
      clients.delete(clientId);
    });

    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });

  // Broadcast verification result to specific client
  function notifyClient(clientId: string, data: any) {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  // Form management routes
  app.post('/api/forms', async (req, res) => {
    try {
      console.log('Creating form with data:', JSON.stringify(req.body, null, 2));
      const validatedData = insertFormConfigSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      const formConfig = await storage.createFormConfig(validatedData);
      res.json(formConfig);
    } catch (error) {
      console.error('Form creation error:', error);
      res.status(400).json({ error: 'Invalid form data', details: error });
    }
  });

  app.get('/api/forms/new', async (req, res) => {
    // Return a template for new form creation
    res.json({
      name: '',
      slug: '',
      purpose: '',
      description: '',
      logoUrl: '',
      formSchema: {
        components: []
      },
      metadata: {}
    });
  });

  app.get('/api/forms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formConfig = await storage.getFormConfig(id);
      
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(formConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve form' });
    }
  });

  app.put('/api/forms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFormConfigSchema.partial().parse(req.body);
      const formConfig = await storage.updateFormConfig(id, validatedData);
      
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(formConfig);
    } catch (error) {
      res.status(400).json({ error: 'Invalid form data', details: error });
    }
  });

  app.get('/api/forms', async (req, res) => {
    try {
      const forms = await storage.listFormConfigs();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve forms' });
    }
  });

  // Get public forms for community section
  app.get('/api/forms/public', async (req, res) => {
    try {
      const publicForms = await storage.listPublicFormConfigs();
      res.json(publicForms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve public forms' });
    }
  });

  // Clone a form (create a copy)
  app.post('/api/forms/:id/clone', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { authorId = "demo", authorName = "Demo User" } = req.body;
      
      const clonedForm = await storage.cloneFormConfig(id, authorId, authorName);
      res.json(clonedForm);
    } catch (error) {
      if (error.message === 'Form not found') {
        res.status(404).json({ error: 'Form not found' });
      } else {
        res.status(500).json({ error: 'Failed to clone form' });
      }
    }
  });

  app.get('/api/forms/slug/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const formConfig = await storage.getFormConfigBySlug(slug);
      
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(formConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve form' });
    }
  });

  // Form submission routes
  app.post('/api/forms/:id/submit', async (req, res) => {
    try {
      const formConfigId = parseInt(req.params.id);
      const validatedData = insertFormSubmissionSchema.parse({
        formConfigId,
        submissionData: req.body.submissionData,
        verifiedFields: req.body.verifiedFields
      });
      
      const submission = await storage.createFormSubmission(validatedData);
      res.json(submission);
    } catch (error) {
      res.status(400).json({ error: 'Invalid submission data', details: error });
    }
  });

  app.get('/api/forms/:id/submissions', async (req, res) => {
    try {
      const formConfigId = parseInt(req.params.id);
      const submissions = await storage.getFormSubmissions(formConfigId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
  });

  // Credential definition routes
  app.get('/api/credentials/defs', async (req, res) => {
    try {
      // Get from both local storage and VC API
      const [localDefs, apiDefs] = await Promise.all([
        storage.listCredentialDefinitions(),
        vcApiService.listCredentialDefinitions()
      ]);
      
      res.json({
        local: localDefs,
        api: apiDefs
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve credential definitions' });
    }
  });

  // Credential library routes
  app.get('/api/cred-lib', async (req, res) => {
    try {
      const templates = await storage.listCredentialTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve credential templates' });
    }
  });

  app.get('/api/cred-lib/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid credential template ID' });
      }
      
      const template = await storage.getCredentialTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Credential template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching credential template:', error);
      res.status(500).json({ error: 'Failed to fetch credential template' });
    }
  });

  app.post('/api/cred-lib', async (req, res) => {
    try {
      const validatedData = insertCredentialTemplateSchema.parse(req.body);
      const template = await storage.createCredentialTemplate(validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: 'Invalid template data', details: error });
    }
  });

  app.put('/api/cred-lib/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCredentialTemplateSchema.partial().parse(req.body);
      const template = await storage.updateCredentialTemplate(id, validatedData);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: 'Invalid template data', details: error });
    }
  });

  app.delete('/api/cred-lib/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCredentialTemplate(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });

  // Proof request routes
  app.post('/api/proofs/request', async (req, res) => {
    try {
      const { formId, clientId } = req.body;
      
      const formConfig = await storage.getFormConfig(formId);
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }

      // Extract VC requirements from form metadata
      const metadata = formConfig.metadata as any;
      const vcFields = Object.entries(metadata.fields || {})
        .filter(([_, fieldMeta]: [string, any]) => fieldMeta.type === 'verified')
        .map(([fieldKey, fieldMeta]: [string, any]) => fieldMeta.vcMapping);

      if (vcFields.length === 0) {
        return res.json({ message: 'No VC verification required for this form' });
      }

      // Create proof request for the first VC type (simplification)
      const firstVcField = vcFields[0];
      const proofRequest = {
        id: `proof_${Date.now()}`,
        credentialType: firstVcField.credentialType,
        issuerDid: firstVcField.issuerDid,
        attributes: vcFields.map((field: any) => field.attributeName),
        nonce: Math.random().toString(36).substring(7)
      };

      const result = await vcApiService.sendProofRequest(proofRequest);
      
      // Store client ID for later notification
      req.app.locals.proofRequests = req.app.locals.proofRequests || {};
      req.app.locals.proofRequests[result.requestId] = { clientId, formId };

      res.json({
        ...result,
        proofRequest
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create proof request', details: error });
    }
  });

  // Webhook for VC verification callback
  app.post('/api/proofs/verify-callback', async (req, res) => {
    try {
      const verificationResult = await vcApiService.verifyProofCallback(req.body);
      
      // Extract request ID from callback (implementation depends on VC API)
      const requestId = req.body.requestId || req.body.proofRequestId;
      
      if (verificationResult.verified) {
        // Notify the client via WebSocket
        const proofRequests = req.app.locals.proofRequests || {};
        const requestInfo = proofRequests[requestId];
        
        if (requestInfo) {
          notifyClient(requestInfo.clientId, {
            type: 'proof_verified',
            attributes: verificationResult.attributes,
            formId: requestInfo.formId,
            timestamp: verificationResult.timestamp
          });

          // Clean up
          delete proofRequests[requestId];
        }
      }

      res.json({ status: 'processed' });
    } catch (error) {
      console.error('Verification callback error:', error);
      res.status(500).json({ error: 'Failed to process verification callback' });
    }
  });

  // Simulate VC verification for demo purposes
  app.post('/api/proofs/simulate-verification', async (req, res) => {
    try {
      const { clientId, formId } = req.body;
      
      // Simulate verification after a delay
      setTimeout(() => {
        const mockAttributes = {
          employeeId: "EMP-12345",
          companyEmail: "john.doe@company.com",
          jobTitle: "Software Engineer",
          department: "Engineering"
        };

        notifyClient(clientId, {
          type: 'proof_verified',
          attributes: mockAttributes,
          formId,
          timestamp: new Date().toISOString()
        });
      }, 2000);

      res.json({ message: 'Verification simulation started' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to simulate verification' });
    }
  });

  return httpServer;
}
