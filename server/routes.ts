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

  // User profile routes
  app.get('/api/auth/user', async (req, res) => {
    // Return mock user data for now - in production this would be authenticated
    const user = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      organization: "Demo Organization",
      jobTitle: "Product Manager",
      linkedinProfile: "https://linkedin.com/in/johndoe",
      website: "https://johndoe.com",
      bio: "Passionate about building digital identity solutions and streamlining verification processes.",
      profileImage: null,
      location: "Vancouver, BC",
      timezone: "America/Vancouver"
    };
    res.json(user);
  });

  app.put('/api/auth/user', async (req, res) => {
    try {
      // In production, this would update the authenticated user's profile
      const updatedUser = { ...req.body, id: 1 };
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update profile' });
    }
  });

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

  // Get public forms for community section
  app.get('/api/forms/public', async (req, res) => {
    // Return sample community forms that are distinct from user's personal forms
    const communityForms = [
      {
        id: 1001,
        name: "BC Government Employee Verification",
        slug: "bc-gov-employee-verification", 
        purpose: "Verify employment status for government benefits and services",
        description: "This form verifies your employment with the BC Government using your digital business card credential.",
        title: "BC Government Employee Verification",
        logoUrl: "",
        formSchema: { components: [] },
        metadata: {},
        proofRequests: [],
        revocationPolicies: {},
        authorId: "mathieu-glaude",
        authorName: "Mathieu Glaude", 
        authorOrg: "4sure Technology Solutions",
        isPublic: true,
        clonedFrom: null,
        createdAt: new Date("2025-06-25").toISOString(),
        updatedAt: new Date("2025-06-25").toISOString()
      },
      {
        id: 1002,
        name: "Professional Services Registration",
        slug: "professional-services-registration",
        purpose: "Register for professional services with verified identity and credentials", 
        description: "Quick registration for professional services using your BC Person Credential for identity verification.",
        title: "Professional Services Registration",
        logoUrl: "",
        formSchema: { components: [] },
        metadata: {},
        proofRequests: [],
        revocationPolicies: {},
        authorId: "mathieu-glaude",
        authorName: "Mathieu Glaude",
        authorOrg: "4sure Technology Solutions", 
        isPublic: true,
        clonedFrom: null,
        createdAt: new Date("2025-06-24").toISOString(),
        updatedAt: new Date("2025-06-24").toISOString()
      },
      {
        id: 1003,
        name: "Event Registration with Age Verification",
        slug: "event-registration-age-verification",
        purpose: "Register for events with automatic age verification using BC Person Credential",
        description: "Streamlined event registration that automatically verifies your age for age-restricted events.",
        title: "Event Registration with Age Verification", 
        logoUrl: "",
        formSchema: { components: [] },
        metadata: {},
        proofRequests: [],
        revocationPolicies: {},
        authorId: "mathieu-glaude",
        authorName: "Mathieu Glaude",
        authorOrg: "4sure Technology Solutions",
        isPublic: true, 
        clonedFrom: null,
        createdAt: new Date("2025-06-23").toISOString(),
        updatedAt: new Date("2025-06-23").toISOString()
      },
      {
        id: 1004,
        name: "Contact Us - Simple Form",
        slug: "contact-us-simple", 
        purpose: "Basic contact form for general inquiries",
        description: "Get in touch with us using this simple contact form. No credentials required.",
        title: "Contact Us - Simple Form",
        logoUrl: "",
        formSchema: { components: [] },
        metadata: {},
        proofRequests: [],
        revocationPolicies: {},
        authorId: "mathieu-glaude", 
        authorName: "Mathieu Glaude",
        authorOrg: "4sure Technology Solutions",
        isPublic: true,
        clonedFrom: null,
        createdAt: new Date("2025-06-22").toISOString(),
        updatedAt: new Date("2025-06-22").toISOString()
      }
    ];
    
    res.json(communityForms);
  });

  app.get('/api/forms', async (req, res) => {
    try {
      const forms = await storage.listFormConfigs();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve forms' });
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
