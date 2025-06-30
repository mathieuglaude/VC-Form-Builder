import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { vcApiService } from "./services/vcApi";
import { createProofRequest, sendProofRequest, getProofStatus, verifyProofCallback, createSchema, createCredentialDefinition, issueCredential, getIssuanceStatus, verifyIssuanceCallback } from "./services/orbit";
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

  // Simple in-memory storage for demo - in production this would be in database
  let currentUserProfile = {
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

  // User profile routes
  app.get('/api/auth/user', async (req, res) => {
    res.json(currentUserProfile);
  });

  app.put('/api/auth/user', async (req, res) => {
    try {
      // Update the stored profile with new data
      currentUserProfile = { ...currentUserProfile, ...req.body };
      res.json(currentUserProfile);
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
    } catch (error: any) {
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

  // Form submission routes with credential issuance action
  app.post('/api/forms/:id/submit', async (req, res) => {
    try {
      const formConfigId = parseInt(req.params.id);
      const validatedData = insertFormSubmissionSchema.parse({
        formConfigId,
        submissionData: req.body.submissionData,
        verifiedFields: req.body.verifiedFields
      });
      
      const submission = await storage.createFormSubmission(validatedData);
      
      // Check if form has credential issuance action configured
      const formConfig = await storage.getFormConfig(formConfigId);
      const issuanceActions = formConfig?.metadata?.issuanceActions;
      
      if (issuanceActions && issuanceActions.length > 0) {
        // Process each issuance action
        for (const action of issuanceActions) {
          await processIssuanceAction(action, submission, req.body.holderDid);
        }
      }
      
      res.json(submission);
    } catch (error: any) {
      console.error('Form submission error:', error);
      res.status(400).json({ error: 'Invalid submission data', details: error.message });
    }
  });

  // Helper function to process credential issuance actions
  async function processIssuanceAction(action: any, submission: any, holderDid?: string) {
    try {
      if (!holderDid) {
        console.warn('No holder DID provided for credential issuance');
        return;
      }

      const { credDefId, attributeMapping } = action;
      
      // Map form submission data to credential attributes
      const attributes: Record<string, any> = {};
      for (const [credAttr, formField] of Object.entries(attributeMapping)) {
        const value = submission.submissionData[formField as string];
        if (value !== undefined && value !== null) {
          attributes[credAttr] = value;
        }
      }

      // Issue credential via Orbit Enterprise
      const result = await issueCredential(credDefId, holderDid, attributes);
      
      console.log(`Credential issuance initiated for submission ${submission.id}:`, result);
      
      // Store operation ID for status tracking
      // In production, you might want to store this in the database
      
    } catch (error) {
      console.error('Credential issuance action failed:', error);
    }
  }

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

  // Orbit Proof API routes
  app.post('/api/proofs/init', async (req, res) => {
    try {
      const { formId } = req.body;
      
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

      // Extract required attributes from VC fields
      const attributes = vcFields.map((field: any) => field.attributeName);
      
      // Create proof request via Orbit Enterprise
      const result = await createProofRequest(formId, attributes);
      
      res.json({
        proofReqId: result.proofRequestId,
        qr: result.qrCode,
        deepLink: result.deepLink
      });
    } catch (error: any) {
      console.error('Proof request creation error:', error);
      res.status(500).json({ error: 'Failed to create proof request', details: error.message });
    }
  });

  // Proof status polling endpoint
  app.get('/api/proofs/:txId', async (req, res) => {
    try {
      const { txId } = req.params;
      const status = await getProofStatus(txId);
      res.json(status);
    } catch (error: any) {
      console.error('Proof status error:', error);
      res.status(500).json({ error: 'Failed to get proof status', details: error.message });
    }
  });

  // Orbit webhook endpoint
  app.post('/webhook/orbit', async (req, res) => {
    try {
      const webhookType = req.body.type || 'proof';
      
      if (webhookType === 'proof') {
        const proofResult = await verifyProofCallback(req.body);
        
        if (proofResult.verified) {
          const { formId, clientId } = req.body;
          
          notifyClient(clientId, {
            type: 'proof_verified',
            attributes: proofResult.attributes,
            formId,
            timestamp: proofResult.timestamp,
            transactionId: proofResult.transactionId
          });
        }
      } else if (webhookType === 'issuance') {
        const issuanceResult = await verifyIssuanceCallback(req.body);
        
        if (issuanceResult.issued) {
          const { submissionId, clientId } = req.body;
          
          if (clientId) {
            notifyClient(clientId, {
              type: 'credential_issued',
              credentialId: issuanceResult.credentialId,
              submissionId,
              timestamp: issuanceResult.timestamp
            });
          }
        }
      }

      res.json({ status: 'processed' });
    } catch (error: any) {
      console.error('Orbit webhook error:', error);
      res.status(500).json({ error: 'Failed to process webhook', details: error.message });
    }
  });

  // Credential Issuance routes
  app.post('/api/credentials/schema', async (req, res) => {
    try {
      const { schemaName, version, attributes } = req.body;
      const result = await createSchema(schemaName, version, attributes);
      res.json(result);
    } catch (error: any) {
      console.error('Schema creation error:', error);
      res.status(500).json({ error: 'Failed to create schema', details: error.message });
    }
  });

  app.post('/api/credentials/definition', async (req, res) => {
    try {
      const { schemaId, tag } = req.body;
      const result = await createCredentialDefinition(schemaId, tag);
      res.json(result);
    } catch (error: any) {
      console.error('Credential definition creation error:', error);
      res.status(500).json({ error: 'Failed to create credential definition', details: error.message });
    }
  });

  app.post('/api/credentials/issue', async (req, res) => {
    try {
      const { credDefId, holderDid, attributes } = req.body;
      const result = await issueCredential(credDefId, holderDid, attributes);
      res.json(result);
    } catch (error: any) {
      console.error('Credential issuance error:', error);
      res.status(500).json({ error: 'Failed to issue credential', details: error.message });
    }
  });

  app.get('/api/credentials/issuance/:operationId', async (req, res) => {
    try {
      const { operationId } = req.params;
      const status = await getIssuanceStatus(operationId);
      res.json(status);
    } catch (error: any) {
      console.error('Issuance status error:', error);
      res.status(500).json({ error: 'Failed to get issuance status', details: error.message });
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
