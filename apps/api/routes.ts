import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { vcApiService } from "./services/vcApi";
import proofsRouter from "./routes/proofs";
import adminCredentialsRouter from "./routes/adminCredentials";
import { insertFormConfigSchema, insertFormSubmissionSchema, insertCredentialTemplateSchema, credentialTemplates, credentialAttributes } from "../../packages/shared/schema";
import { z } from "zod";
import { ensureLawyerCred } from "./ensureLawyerCred";
import { downloadAsset, fetchOCABundle } from "./ocaAssets";
import { eq } from "drizzle-orm";
import { db } from "./db";

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
    timezone: "America/Vancouver",
    role: "super_admin" as const
  };

  // Simple auth middleware for demo
  app.use((req, res, next) => {
    req.user = { id: currentUserProfile.id, role: currentUserProfile.role };
    next();
  });

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

  // Check slug availability
  app.get('/api/forms/slug-check', async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug) {
        return res.status(400).json({ error: 'slug required' });
      }
      
      const existing = await storage.getFormConfigByPublicSlug(slug as string);
      res.json({ available: !existing });
    } catch (error) {
      console.error('Slug check error:', error);
      res.status(500).json({ error: 'Failed to check slug availability' });
    }
  });

  // Publish form with custom slug
  app.post('/api/forms/:id/publish', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { slug } = req.body;
      
      if (!slug) {
        return res.status(400).json({ error: 'slug required' });
      }
      
      // Check if slug is already taken
      const existing = await storage.getFormConfigByPublicSlug(slug);
      if (existing) {
        return res.status(409).json({ error: 'slug taken' });
      }
      
      const publishedForm = await storage.publishFormConfigWithSlug(id, slug);
      
      if (!publishedForm) {
        return res.status(404).json({ error: 'Form not found' });
      }
      
      res.json(publishedForm);
    } catch (error: any) {
      console.error('Form publish error:', error);
      res.status(500).json({ error: 'Failed to publish form', details: error.message });
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
    } catch (error: any) {
      console.error('Form publish error:', error);
      res.status(500).json({ error: 'Failed to publish form', details: error.message });
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

  // Get form by public slug (for published forms)
  app.get('/f/:slug', async (req, res) => {
    try {
      const publicSlug = req.params.slug;
      const form = await storage.getFormConfigByPublicSlug(publicSlug);
      
      if (!form) {
        return res.status(404).json({ error: 'Published form not found' });
      }
      
      res.json(form);
    } catch (error: any) {
      console.error('Get published form error:', error);
      res.status(500).json({ error: 'Failed to retrieve published form' });
    }
  });

  app.delete('/api/forms/:id', async (req, res) => {
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
      const metadata = formConfig?.metadata as any;
      const issuanceActions = metadata?.issuanceActions;
      
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

      // TODO: Re-enable credential issuance after core proof flow works
      // const result = await issueCredential(credDefId, holderDid, attributes);
      
      console.log(`Credential issuance initiated for submission ${submission.id}`);
      
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
      
      // Transform overlay structure to the format expected by frontend
      const withBranding = templates.map(tpl => {
        const branding = tpl.overlays.find(o => o.type.includes('branding'))?.data ?? {};
        const meta = tpl.overlays.find(o => o.type.includes('meta'))?.data ?? {};
        
        return {
          ...tpl,
          branding,
          meta,
          // Ensure issuer name is human readable
          issuer: meta.issuer || meta.issuer_name || 'Unknown Issuer',
          issuerUrl: meta.issuer_url || meta.issuerUrl,
          description: meta.description || `${tpl.label} credential`,
          // Extract attributes from capture_base overlay if available
          attributes: (() => {
            const captureBase = tpl.overlays.find(o => o.type.includes('capture_base'));
            if (captureBase?.data?.attributes) {
              return Object.entries(captureBase.data.attributes).map(([name, config]: [string, any]) => ({
                name,
                description: config.description || name
              }));
            }
            return [];
          })()
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

  // Health check endpoint to restore missing credentials
  app.post('/api/admin/credentials/health', async (req, res) => {
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
    } catch (error: any) {
      console.error('Orbit webhook error:', error);
      res.status(500).json({ error: 'Failed to process webhook', details: error.message });
    }
  });

  // TODO: Re-enable credential issuance routes after core proof flow works

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

  // Credential Template Import
  app.post('/api/cred-templates/import', async (req, res) => {
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
    } catch (error: any) {
      console.error('Credential import error:', error);
      res.status(400).json({ error: error.message || 'Failed to import credential' });
    }
  });

  // Delete Credential Template
  app.delete('/api/cred-templates/:id', async (req, res) => {
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
    } catch (error: any) {
      console.error('Credential delete error:', error);
      res.status(400).json({ error: error.message || 'Failed to delete credential' });
    }
  });

  // Import credential template (for ImportCredentialModal)
  app.post('/api/cred-templates/import', async (req, res) => {
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
    } catch (error: any) {
      console.error('Credential import error:', error);
      res.status(400).json({ error: error.message || 'Failed to import credential' });
    }
  });

  return httpServer;
}
