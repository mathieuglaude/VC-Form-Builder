import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from "express";
import { WebSocketServer, WebSocket } from "ws";
import './types/express'; // Load Express type extensions
import { storage } from "./storage";
import { vcApiService } from "./services/vcApi";
import proofsRouter from "./routes/proofs";
import adminCredentialsRouter from "./routes/adminCredentials";
import defineProofRouter from "./routes/defineProof";
import ocaRouter from "./routes/oca";
import { initFormProof } from "./routes/initFormProof";
import { testImportCredential, getOrbitMapping } from "./routes/credentialImport";
import { insertFormConfigSchema, insertFormSubmissionSchema, insertCredentialTemplateSchema, credentialTemplates, credentialAttributes } from "../../packages/shared/schema";
import { z } from "zod";


import { eq } from "drizzle-orm";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const router = Router();

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
  function notifyClient(clientId: string, data: Record<string, unknown>) {
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
    timezone: "America/Vancouver",
    role: "super_admin" as const
  };

  // Simple auth middleware for demo
  router.use((req, res, next) => {
    req.user = { id: currentUserProfile.id, role: currentUserProfile.role };
    next();
  });

  // User profile routes
  router.get('/auth/user', async (req, res) => {
    res.json(currentUserProfile);
  });

  router.put('/auth/user', async (req, res) => {
    try {
      // Update the stored profile with new data
      currentUserProfile = { ...currentUserProfile, ...req.body };
      res.json(currentUserProfile);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update profile' });
    }
  });

  // Form management routes
  router.post('/forms', async (req, res) => {
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

  router.get('/forms/new', async (req, res) => {
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

  // Check slug availability (must come before /:id routes)
  router.get('/forms/slug-check', async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug) {
        return res.status(400).json({ error: 'slug required' });
      }
      
      const available = await storage.checkPublicSlugAvailability(slug as string);
      res.json({ available });
    } catch (error) {
      console.error('Slug check error:', error);
      res.status(500).json({ error: 'Failed to check slug availability' });
    }
  });

  router.get('/forms/:id', async (req, res) => {
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

  router.put('/forms/:id', async (req, res) => {
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

  // Get published form by public slug
  router.get('/pub-forms/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const formConfig = await storage.getFormConfigByPublicSlug(slug);
      
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(formConfig);
    } catch (error) {
      console.error('Public form lookup error:', error);
      res.status(500).json({ error: 'Failed to retrieve form' });
    }
  });

  // Publish form with custom slug
  router.post('/forms/:id/publish', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { slug } = req.body;
      
      if (!slug) {
        return res.status(400).json({ error: 'slug required' });
      }
      
      // Check if slug is already taken
      const available = await storage.checkPublicSlugAvailability(slug);
      if (!available) {
        return res.status(409).json({ error: 'slug taken' });
      }
      
      const publishedForm = await storage.publishFormConfigWithSlug(id, slug);
      
      if (!publishedForm) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(publishedForm);
    } catch (error: unknown) {
      console.error('Form publish error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to publish form', details: errorMessage });
    }
  });

  // Legacy publish endpoint (for backward compatibility)
  app.patch('/api/forms/:id/publish', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { transport } = req.body;
      
      if (!transport || !['connection', 'oob'].includes(transport)) {
        return res.status(400).json({ error: 'Valid transport (connection or oob) is required' });
      }
      
      const publishedForm = await storage.publishFormConfig(id, transport);
      
      if (!publishedForm) {
        return res.status(409).json({ error: 'Form not found or already published' });
      }
      
      res.json({ slug: publishedForm.publicSlug });
    } catch (error: unknown) {
      console.error('Form publish error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to publish form', details: errorMessage });
    }
  });

  // Public form access API endpoint  
  app.get('/public/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const formConfig = await storage.getFormConfigByPublicSlug(slug);
      
      if (!formConfig || !formConfig.isPublished) {
        return res.status(404).json({ error: 'Form not found or not published' });
      }
      
      res.json(formConfig);
    } catch (error) {
      console.error('Public form access error:', error);
      res.status(500).json({ error: 'Failed to retrieve form' });
    }
  });



  router.delete('/forms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formConfig = await storage.getFormConfig(id);
      
      if (!formConfig) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      const deleted = await storage.deleteFormConfig(id);
      
      if (deleted) {
        res.json({ success: true, message: 'Form deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete form' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete form' });
    }
  });

  // Get public forms for community section
  router.get('/forms/public', async (req, res) => {
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

  router.get('/forms', async (req, res) => {
    try {
      const forms = await storage.listFormConfigs();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve forms' });
    }
  });

  // Clone a form (create a copy)
  router.post('/forms/:id/clone', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { authorId = "demo", authorName = "Demo User" } = req.body;
      
      const clonedForm = await storage.cloneFormConfig(id, authorId, authorName);
      res.json(clonedForm);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Form not found') {
        res.status(404).json({ error: 'Form not found' });
      } else {
        res.status(500).json({ error: 'Failed to clone form' });
      }
    }
  });

  router.get('/forms/slug/:slug', async (req, res) => {
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
  router.post('/forms/:id/submit', async (req, res) => {
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
      const metadata = formConfig?.metadata as Record<string, unknown>;
      const issuanceActions = Array.isArray(metadata?.issuanceActions) ? metadata.issuanceActions : [];
      
      if (issuanceActions && issuanceActions.length > 0) {
        // Process each issuance action
        for (const action of issuanceActions) {
          await processIssuanceAction(action, submission, req.body.holderDid);
        }
      }
      
      res.json(submission);
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: 'Invalid submission data', details: errorMessage });
    }
  });

  // Helper function to process credential issuance actions
  async function processIssuanceAction(action: Record<string, unknown>, submission: Record<string, unknown>, holderDid?: string) {
    try {
      if (!holderDid) {
        console.warn('No holder DID provided for credential issuance');
        return;
      }

      const credDefId = action.credDefId as string;
      const attributeMapping = action.attributeMapping as Record<string, string>;
      
      if (!credDefId || !attributeMapping) {
        console.warn('Invalid issuance action configuration');
        return;
      }
      
      // Map form submission data to credential attributes
      const attributes: Record<string, unknown> = {};
      const submissionData = submission.submissionData as Record<string, unknown>;
      
      for (const [credAttr, formField] of Object.entries(attributeMapping)) {
        const value = submissionData[formField];
        if (value !== undefined && value !== null) {
          attributes[credAttr] = value;
        }
      }

      // TODO: Re-enable credential issuance after core proof flow works
      // const result = await issueCredential(credDefId, holderDid, attributes);
      
      console.log(`Credential issuance initiated for submission ${submission.id}`);
      
      // Store operation ID for status tracking
      // In production, you might want to store this in the database
      
    } catch (error) {
      console.error('Credential issuance action failed:', error);
    }
  }

  router.get('/forms/:id/submissions', async (req, res) => {
    try {
      const formConfigId = parseInt(req.params.id);
      const submissions = await storage.getFormSubmissions(formConfigId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
  });

  // Credential definition routes
  router.get('/credentials/defs', async (req, res) => {
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
  router.get('/cred-lib', async (req, res) => {
    try {
      const templates = await storage.listCredentialTemplates();
      
      // Transform unified OCA metadata structure to the format expected by frontend
      const withBranding = templates.map(tpl => {
        const schemaMetadata = tpl.schemaMetadata;
        const cryptographicMetadata = tpl.cryptographicMetadata;
        const brandingMetadata = tpl.brandingMetadata;
        const ecosystemMetadata = tpl.ecosystemMetadata;
        const orbitIntegration = tpl.orbitIntegration;
        
        return {
          id: tpl.id,
          label: tpl.label,
          version: tpl.version,
          // Schema information
          schemaId: schemaMetadata.schemaId,
          credDefId: cryptographicMetadata.credDefId,
          issuerDid: cryptographicMetadata.issuerDid,
          attributes: schemaMetadata.attributes,
          // Branding and display
          branding: {
            logoUrl: brandingMetadata.logo?.url,
            backgroundImage: brandingMetadata.backgroundImage?.url,
            primaryColor: brandingMetadata.colors?.primary,
            layout: brandingMetadata.layout
          },
          meta: {
            issuer: brandingMetadata.issuerName,
            issuerUrl: brandingMetadata.issuerWebsite,
            description: brandingMetadata.description
          },
          // Compatibility and ecosystem
          ecosystem: ecosystemMetadata.ecosystem,
          interopProfile: ecosystemMetadata.interopProfile,
          compatibleWallets: ecosystemMetadata.compatibleWallets,
          walletRestricted: ecosystemMetadata.walletRestricted,
          // Governance
          governanceUrl: cryptographicMetadata.governanceFramework,
          // Orbit integration
          orbitSchemaId: orbitIntegration?.orbitSchemaId || 'N/A',
          orbitCredDefId: orbitIntegration?.orbitCredDefId || 'N/A',
          // Administrative
          isPredefined: tpl.isPredefined,
          visible: tpl.visible,
          createdAt: tpl.createdAt,
          updatedAt: tpl.updatedAt,
          description: brandingMetadata.description || `${tpl.label} credential`
        };
      });
      
      // Sort alphabetically by label for consistent ordering
      const sortedTemplates = withBranding
        .filter(t => t.visible !== false)
        .sort((a, b) => a.label.localeCompare(b.label));
      
      res.json(sortedTemplates);
    } catch (error) {
      console.error('Failed to retrieve credential templates:', error);
      res.status(500).json({ error: 'Failed to retrieve credential templates' });
    }
  });

  router.get('/cred-lib/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid credential template ID' });
      }
      
      const template = await storage.getCredentialTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Credential template not found' });
      }
      
      // Transform unified OCA metadata structure to the format expected by frontend
      const schemaMetadata = template.schemaMetadata;
      const cryptographicMetadata = template.cryptographicMetadata;
      const brandingMetadata = template.brandingMetadata;
      const ecosystemMetadata = template.ecosystemMetadata;
      const orbitIntegration = template.orbitIntegration;
      
      const transformedTemplate = {
        id: template.id,
        label: template.label,
        version: template.version,
        // Schema information
        schemaId: schemaMetadata.schemaId,
        credDefId: cryptographicMetadata.credDefId,
        issuerDid: cryptographicMetadata.issuerDid,
        attributes: schemaMetadata.attributes,
        // Branding and display
        branding: {
          logoUrl: brandingMetadata.logo?.url,
          backgroundImage: brandingMetadata.backgroundImage?.url,
          primaryColor: brandingMetadata.colors?.primary,
          layout: brandingMetadata.layout
        },
        meta: {
          issuer: brandingMetadata.issuerName,
          issuerUrl: brandingMetadata.issuerWebsite,
          description: brandingMetadata.description
        },
        // Compatibility and ecosystem
        ecosystem: ecosystemMetadata.ecosystem,
        interopProfile: ecosystemMetadata.interopProfile,
        compatibleWallets: ecosystemMetadata.compatibleWallets,
        walletRestricted: ecosystemMetadata.walletRestricted,
        // Governance
        governanceUrl: cryptographicMetadata.governanceFramework,
        // Orbit integration
        orbitSchemaId: orbitIntegration?.orbitSchemaId || 'N/A',
        orbitCredDefId: orbitIntegration?.orbitCredDefId || 'N/A',
        // Administrative
        isPredefined: template.isPredefined,
        visible: template.visible,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        // Ensure issuer name is human readable
        issuer: brandingMetadata.issuerName || 'Unknown Issuer',
        issuerUrl: brandingMetadata.issuerWebsite,
        description: brandingMetadata.description || `${template.label} credential`
      };
      
      res.json(transformedTemplate);
    } catch (error) {
      console.error('Error fetching credential template:', error);
      res.status(500).json({ error: 'Failed to fetch credential template' });
    }
  });

  router.post('/cred-lib', async (req, res) => {
    try {
      const validatedData = insertCredentialTemplateSchema.parse(req.body);
      const template = await storage.createCredentialTemplate(validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: 'Invalid template data', details: error });
    }
  });

  router.put('/cred-lib/:id', async (req, res) => {
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

  router.delete('/cred-lib/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid credential template ID' });
      }
      
      // Check if credential exists and get its details
      const template = await storage.getCredentialTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Credential template not found' });
      }
      
      // Prevent deletion of predefined BC Government credentials
      if (template.isPredefined) {
        return res.status(403).json({ 
          error: 'Cannot delete predefined credentials',
          message: 'BC Government credentials cannot be deleted as they are required for the system.'
        });
      }
      
      console.log(`[CREDENTIAL-DELETE] Deleting credential template: ${template.label} (ID: ${id})`);
      
      const deleted = await storage.deleteCredentialTemplate(id);
      
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete credential template' });
      }
      
      console.log(`[CREDENTIAL-DELETE] Successfully deleted credential template: ${template.label}`);
      res.json({ 
        success: true, 
        message: `Credential "${template.label}" has been permanently deleted.`
      });
    } catch (error: unknown) {
      console.error('[CREDENTIAL-DELETE] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        error: 'Failed to delete credential template', 
        details: errorMessage 
      });
    }
  });

  // Health check endpoint to restore missing credentials
  router.post('/admin/credentials/health', async (req, res) => {
    try {
      await ensureLawyerCred();
      res.status(204).send();
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  // Register proofs router
  app.use('/api/proofs', proofsRouter);
  
  // Register admin credential management routes
  app.use('/api/admin/credentials', adminCredentialsRouter);

  // Orbit webhook endpoint
  app.post('/webhook/orbit', async (req, res) => {
    try {
      const payload = req.body;
      console.log('Orbit webhook received:', JSON.stringify(payload, null, 2));
      
      // Handle proof verification webhook
      if (payload.state === 'verified' && payload.txId) {
        // Broadcast proof verification success via WebSocket
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'proof_verified',
              txId: payload.txId,
              attributes: payload.attributes || {},
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
      
      // TODO: Re-enable credential issuance webhook after core proof flow works

      res.json({ status: 'processed' });
    } catch (error: unknown) {
      console.error('Orbit webhook error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to process webhook', details: errorMessage });
    }
  });

  // TODO: Re-enable credential issuance routes after core proof flow works

  // Webhook for VC verification callback
  router.post('/proofs/verify-callback', async (req, res) => {
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
  router.post('/proofs/simulate-verification', async (req, res) => {
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

  // Credential Template Import
  router.post('/cred-templates/import', async (req, res) => {
    try {
      // Validation schema for import
      const importCredentialSchema = z.object({
        label: z.string().min(1, 'Label is required'),
        version: z.string().min(1, 'Version is required'),
        issuerName: z.string().min(1, 'Issuer name is required'),
        issuerDid: z.string().min(1, 'Issuer DID is required'),
        ledgerNetwork: z.string().default('BCOVRIN_TEST'),
        schemaId: z.string().min(1, 'Schema ID is required'),
        credDefId: z.string().min(1, 'Credential Definition ID is required'),
        attributes: z.array(z.string()).min(1, 'At least one attribute is required'),
        bundleUrl: z.string().optional(),
        governanceUrl: z.string().optional(),
        primaryColor: z.string().default('#4F46E5'),
      });

      // Validate input
      const validatedDto = importCredentialSchema.parse(req.body);

      // Check if label already exists
      const existing = await db
        .select()
        .from(credentialTemplates)
        .where(eq(credentialTemplates.label, validatedDto.label))
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({ error: `Credential template with label "${validatedDto.label}" already exists` });
      }

      // Process OCA bundle if provided
      let branding = {};
      let metaOverlay = {};
      let brandBgUrl = null;
      let brandLogoUrl = null;

      if (validatedDto.bundleUrl) {
        try {
          const ocaData = await fetchOCABundle(validatedDto.bundleUrl);
          
          // Download and cache assets
          if (ocaData.logoUrl) {
            brandLogoUrl = await downloadAsset(ocaData.logoUrl);
          }
          if (ocaData.backgroundImageUrl) {
            brandBgUrl = await downloadAsset(ocaData.backgroundImageUrl);
          }

          branding = ocaData.branding || {};
          metaOverlay = ocaData.meta || {};
        } catch (error) {
          console.error('Failed to process OCA bundle:', error);
          // Continue without OCA data - it's optional
        }
      }

      // Prepare attributes with descriptions
      const attributeData = validatedDto.attributes.map((name, index) => ({
        name: name.trim(),
        description: `${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} attribute`,
      }));

      // Insert credential template
      const [template] = await db
        .insert(credentialTemplates)
        .values({
          label: validatedDto.label,
          version: validatedDto.version,
          schemaId: validatedDto.schemaId,
          credDefId: validatedDto.credDefId,
          issuerDid: validatedDto.issuerDid,
          overlays: [],
          governanceUrl: validatedDto.governanceUrl || null,
          attributes: attributeData,
          isPredefined: false,
          ecosystem: 'Custom Import',
          interopProfile: 'AIP 2.0',
          compatibleWallets: [],
          walletRestricted: false,
          branding,
          metaOverlay,
          ledgerNetwork: validatedDto.ledgerNetwork,
          primaryColor: validatedDto.primaryColor,
          brandBgUrl,
          brandLogoUrl,
          visible: true,
        })
        .returning();

      // Insert normalized attributes
      if (attributeData.length > 0) {
        await db.insert(credentialAttributes).values(
          attributeData.map((attr, index) => ({
            templateId: template.id,
            name: attr.name,
            description: attr.description,
            pos: index,
          }))
        );
      }

      res.json(template);
    } catch (error: unknown) {
      console.error('Credential import error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to import credential' });
    }
  });

  // Delete Credential Template
  router.delete('/cred-templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if template is predefined (protected)
      const template = await db
        .select({ isPredefined: credentialTemplates.isPredefined })
        .from(credentialTemplates)
        .where(eq(credentialTemplates.id, id))
        .limit(1);

      if (template.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template[0].isPredefined) {
        return res.status(403).json({ error: 'Cannot delete predefined template' });
      }

      // Delete template (attributes will be deleted by cascade)
      await db
        .delete(credentialTemplates)
        .where(eq(credentialTemplates.id, id));

      res.json({ success: true });
    } catch (error: unknown) {
      console.error('Credential delete error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete credential' });
    }
  });

  // Import credential template (for ImportCredentialModal)
  router.post('/cred-templates/import', async (req, res) => {
    try {
      const {
        label,
        version,
        issuerName,
        issuerDid,
        ledgerNetwork,
        schemaId,
        credDefId,
        attributes,
        bundleUrl,
        governanceUrl,
        primaryColor
      } = req.body;

      // Validate required fields
      if (!label || !version || !issuerDid || !schemaId || !credDefId || !attributes) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Parse attributes if it's a string
      let parsedAttributes;
      if (typeof attributes === 'string') {
        parsedAttributes = attributes.split(',').map(attr => ({
          name: attr.trim(),
          description: attr.trim()
        }));
      } else if (Array.isArray(attributes)) {
        parsedAttributes = attributes.map(attr => ({
          name: typeof attr === 'string' ? attr : attr.name,
          description: typeof attr === 'string' ? attr : (attr.description || attr.name)
        }));
      } else {
        return res.status(400).json({ error: 'Invalid attributes format' });
      }

      // Create overlays structure
      const overlays = [];

      // Add meta overlay
      overlays.push({
        type: 'meta/1.0',
        data: {
          issuer: issuerName || issuerDid,
          issuer_name: issuerName || issuerDid,
          issuer_url: '',
          description: `${label} credential`,
          credential_type: label,
          ledger_network: ledgerNetwork
        }
      });

      // Add branding overlay with primary color
      overlays.push({
        type: 'branding/1.0',
        data: {
          primary_color: primaryColor || '#4F46E5',
          secondary_color: '#6B7280',
          layout: 'default'
        }
      });

      // Add capture base overlay if we have attributes
      if (parsedAttributes.length > 0) {
        const attributesObj = {};
        parsedAttributes.forEach(attr => {
          attributesObj[attr.name] = {
            description: attr.description,
            type: 'text'
          };
        });

        overlays.push({
          type: 'capture_base/1.0',
          data: {
            attributes: attributesObj
          }
        });
      }

      // Insert the credential template
      const [template] = await db
        .insert(credentialTemplates)
        .values({
          issuerDid,
          label,
          version,
          schemaId,
          credDefId,
          attributes: parsedAttributes,
          governanceUrl: governanceUrl || null,
          schemaUrl: null,
          ecosystem: 'Generic',
          interopProfile: 'AIP 2.0',
          ledgerNetwork: ledgerNetwork || 'BCOVRIN_TEST',
          isPredefined: false,
          compatibleWallets: ['generic'],
          walletRestricted: false,
          visible: true,
          overlays: overlays,
          issuer: issuerName || issuerDid,
          issuerUrl: null,
          brandColor: primaryColor || '#4F46E5',
          brandSecondaryColor: '#6B7280',
          brandLogoUrl: null
        })
        .returning();

      res.status(201).json(template);
    } catch (error: unknown) {
      console.error('Credential import error:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to import credential' });
    }
  });

  // Credential import routes for testing external credential registration
  router.post('/credentials/import/test', testImportCredential);
  router.get('/credentials/orbit-mapping/:credentialType', getOrbitMapping);

  // Governance-document-driven credential import routes
  router.post('/governance/parse', async (req, res) => {
    try {
      const { url, content } = req.body;
      
      if (!url && !content) {
        return res.status(400).json({ error: 'Either governance document URL or content is required' });
      }
      
      if (url && content) {
        return res.status(400).json({ error: 'Provide either URL or content, not both' });
      }
      
      const { governanceParserService } = await import('./services/GovernanceParserService');
      
      let parsedMetadata;
      if (url && typeof url === 'string') {
        parsedMetadata = await governanceParserService.parseGovernanceDocument(url);
      } else if (content && typeof content === 'string') {
        parsedMetadata = await governanceParserService.parseGovernanceContent(content);
      } else {
        return res.status(400).json({ error: 'Invalid URL or content format' });
      }
      
      res.json(parsedMetadata);
    } catch (error: unknown) {
      console.error('Governance parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to parse governance document', details: errorMessage });
    }
  });

  router.put('/governance/metadata', async (req, res) => {
    try {
      const metadata = req.body;
      
      // Validate the metadata structure
      const requiredFields = ['credentialName', 'issuerOrganization', 'description'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }
      
      // Simply return the validated metadata (frontend manages state)
      res.json(metadata);
    } catch (error: unknown) {
      console.error('Metadata validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: 'Invalid metadata', details: errorMessage });
    }
  });

  router.get('/schema/options/:governanceData', async (req, res) => {
    try {
      // Parse governance data from URL parameter
      const governanceData = JSON.parse(decodeURIComponent(req.params.governanceData));
      
      if (!governanceData.schemas || !Array.isArray(governanceData.schemas)) {
        return res.status(400).json({ error: 'No schemas found in governance data' });
      }
      
      res.json({ schemas: governanceData.schemas });
    } catch (error: unknown) {
      console.error('Schema options error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to get schema options', details: errorMessage });
    }
  });

  router.get('/schema/candy/:schemaId', async (req, res) => {
    try {
      const { schemaId } = req.params;
      
      if (!schemaId) {
        return res.status(400).json({ error: 'Schema ID is required' });
      }
      
      const { governanceParserService } = await import('./services/GovernanceParserService');
      const schemaData = await governanceParserService.fetchCANdySchemaData(schemaId);
      
      res.json(schemaData);
    } catch (error: unknown) {
      console.error('CANdy schema fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to fetch schema data', details: errorMessage });
    }
  });

  router.get('/creddef/options/:schemaId', async (req, res) => {
    try {
      const { schemaId } = req.params;
      
      if (!schemaId) {
        return res.status(400).json({ error: 'Schema ID is required' });
      }
      
      // For now, return mock credential definition options
      // In a real implementation, this would query the blockchain for available cred defs
      const mockCredDefs = [
        {
          id: `${schemaId}:cred-def:1`,
          name: 'Production Credential Definition',
          environment: schemaId.includes('TEST') ? 'test' : 'prod'
        }
      ];
      
      res.json({ credentialDefinitions: mockCredDefs });
    } catch (error: unknown) {
      console.error('Credential definition options error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to get credential definition options', details: errorMessage });
    }
  });

  router.post('/creddef/validate', async (req, res) => {
    try {
      const { credDefId, schemaId } = req.body;
      
      if (!credDefId || !schemaId) {
        return res.status(400).json({ error: 'Credential definition ID and schema ID are required' });
      }
      
      const { governanceParserService } = await import('./services/GovernanceParserService');
      const validationResult = await governanceParserService.validateCredentialDefinition(credDefId, schemaId);
      
      res.json(validationResult);
    } catch (error: unknown) {
      console.error('Credential definition validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to validate credential definition', details: errorMessage });
    }
  });

  router.post('/oca/download-assets', async (req, res) => {
    try {
      const { ocaBundleUrls } = req.body;
      
      if (!ocaBundleUrls || !Array.isArray(ocaBundleUrls)) {
        return res.status(400).json({ error: 'OCA bundle URLs array is required' });
      }
      
      console.log(`[OCA-DOWNLOAD] Processing ${ocaBundleUrls.length} OCA bundle URLs:`, ocaBundleUrls);
      
      // Use UnifiedOCAProcessor directly to fetch authentic branding assets
      const { UnifiedOCAProcessor } = await import('../../packages/shared/src/oca/UnifiedOCAProcessor');
      
      const brandingAssets = await UnifiedOCAProcessor.fetchMultipleBundles(ocaBundleUrls);
      
      console.log(`[OCA-DOWNLOAD] Successfully processed OCA bundles:`, brandingAssets);
      
      res.json(brandingAssets);
    } catch (error: unknown) {
      console.error('OCA asset download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to download OCA assets', details: errorMessage });
    }
  });

  router.post('/credentials/import', async (req, res) => {
    try {
      const {
        metadata,
        schemaData,
        credDefData,
        brandingAssets,
        ecosystemTag
      } = req.body;
      
      // Validate required data
      if (!metadata || !schemaData || !credDefData || !ecosystemTag) {
        return res.status(400).json({ error: 'Missing required import data' });
      }
      
      console.log('[CREDENTIAL-IMPORT] Starting Orbit integration for:', metadata.credentialName);
      
      // Import schema and credential definition into Orbit Enterprise
      let orbitSchemaId = null;
      let orbitCredDefId = null;
      
      try {
        // Import external schema into Orbit LOB
        console.log('[CREDENTIAL-IMPORT] Importing schema into Orbit:', schemaData.schemaId);
        const { credentialManagementService } = await import('./services/credentialManagementService');
        
        const schemaImportResult = await credentialManagementService.importExternalSchema({
          externalSchemaId: schemaData.schemaId,
          name: schemaData.name,
          version: schemaData.version,
          attributes: schemaData.attributes.map(attr => attr.name)
        });
        
        orbitSchemaId = schemaImportResult.orbitSchemaId;
        console.log('[CREDENTIAL-IMPORT] Schema imported to Orbit with ID:', orbitSchemaId);
        
        // Import external credential definition into Orbit LOB
        console.log('[CREDENTIAL-IMPORT] Importing credential definition into Orbit:', credDefData.credDefId);
        const credDefImportResult = await credentialManagementService.importExternalCredentialDefinition({
          externalCredDefId: credDefData.credDefId,
          orbitSchemaId: orbitSchemaId,
          tag: credDefData.tag || 'default',
          issuerDid: schemaData.issuerDid
        });
        
        orbitCredDefId = credDefImportResult.orbitCredDefId;
        console.log('[CREDENTIAL-IMPORT] Credential definition imported to Orbit with ID:', orbitCredDefId);
        
      } catch (orbitError) {
        console.warn('[CREDENTIAL-IMPORT] Orbit integration failed, continuing with local storage:', orbitError);
        // Continue with credential creation even if Orbit import fails
      }
      
      // Create the credential template using the existing schema
      const templateData = {
        label: metadata.credentialName,
        version: schemaData.version,
        schemaMetadata: {
          schemaId: schemaData.schemaId,
          name: schemaData.name,
          version: schemaData.version,
          attributes: schemaData.attributes
        },
        cryptographicMetadata: {
          credDefId: credDefData.credDefId,
          issuerDid: schemaData.issuerDid,
          governanceFramework: metadata.governanceUrl || null
        },
        brandingMetadata: {
          issuerName: metadata.issuerOrganization,
          issuerWebsite: metadata.issuerWebsite || null,
          description: metadata.description,
          logo: brandingAssets?.logo ? { url: brandingAssets.logo } : null,
          backgroundImage: brandingAssets?.backgroundImage ? { url: brandingAssets.backgroundImage } : null,
          colors: brandingAssets?.colors || { primary: '#4F46E5' },
          layout: brandingAssets?.layout || 'default'
        },
        ecosystemMetadata: {
          ecosystem: ecosystemTag,
          interopProfile: 'AIP 2.0'
        },
        orbitIntegration: orbitSchemaId ? {
          orbitSchemaId: orbitSchemaId,
          orbitCredDefId: orbitCredDefId,
          importedAt: new Date()
        } : null,
        isPredefined: false,
        visible: true
      };
      
      const template = await storage.createCredentialTemplate(templateData);
      
      console.log('[CREDENTIAL-IMPORT] Successfully created credential template with Orbit IDs:', {
        templateId: template.id,
        orbitSchemaId,
        orbitCredDefId
      });
      
      res.status(201).json(template);
    } catch (error: unknown) {
      console.error('Credential import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to import credential', details: errorMessage });
    }
  });

  // Mount all API routes under /api prefix
  app.use('/api', router);
  
  // Mount sub-routers
  app.use('/api', proofsRouter);
  app.use('/api', adminCredentialsRouter);
  app.use('/api', defineProofRouter);
  app.use('/api/oca', ocaRouter);

  return httpServer;
}
