import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { formConfigs, credentialTemplates } from '@shared/schema';
import { getVerifierClient, type ProofDefinition, type ProofRequest } from '../../../packages/external/orbit/VerifierClient.js';

const router = Router();

interface FieldRequirement {
  templateId: string;
  attribute: string;
  required: boolean;
  credDefId: string;
  issuerDid: string;
}

// Helper function to build requirements from a form
async function buildRequirements(formId: number): Promise<FieldRequirement[]> {
  // Get the form configuration
  const [form] = await db
    .select()
    .from(formConfigs)
    .where(eq(formConfigs.id, formId));

  if (!form) {
    throw new Error('Form not found');
  }

  const requirements: FieldRequirement[] = [];
  const formSchema = form.formSchema as any;
  const metadata = form.metadata as any;

  // Process each component in the form schema
  if (formSchema?.components) {
    for (const component of formSchema.components) {
      const fieldKey = component.key;
      const fieldMetadata = metadata?.fields?.[fieldKey];

      // Check both component properties and field metadata for VC mapping
      const componentVcMapping = component.properties?.vcMapping;
      const metadataVcMapping = fieldMetadata?.vcMapping;
      const vcMapping = componentVcMapping || metadataVcMapping;

      // Check both component properties and field metadata for data source and credential mode
      const componentDataSource = component.properties?.dataSource;
      const metadataDataSource = fieldMetadata?.type;
      const dataSource = componentDataSource || metadataDataSource;

      const componentCredentialMode = component.properties?.credentialMode;
      const metadataCredentialMode = fieldMetadata?.credentialMode;
      const credentialMode = componentCredentialMode || metadataCredentialMode || 'optional';

      // Only process verified credential fields
      if ((dataSource === 'verified' || metadataDataSource === 'verified') && vcMapping) {
        const { credentialType, attributeName } = vcMapping;
        const isRequired = component.validate?.required || credentialMode === 'required';

        console.log('Processing VC field:', {
          fieldKey,
          credentialType,
          attributeName,
          credentialMode,
          isRequired
        });

        // Find the credential template by label
        const [template] = await db
          .select()
          .from(credentialTemplates)
          .where(eq(credentialTemplates.label, credentialType));

        if (template) {
          console.log('Found matching template:', template.label);
          requirements.push({
            templateId: credentialType,
            attribute: attributeName,
            required: isRequired,
            credDefId: template.credDefId,
            issuerDid: template.issuerDid
          });
        } else {
          console.log('No template found for:', credentialType);
        }
      }
    }
  }

  return requirements;
}

// In-memory cache for proof definitions and requests
const proofDefinitionCache = new Map<string, string>(); // formId -> proofDefinitionId
const proofRequestCache = new Map<string, { formId: number; proofRequestId: string; ts: number }>(); // proofRequestId -> data

// Helper function to create Orbit proof definition
function makeOrbitProofDefinition(requirements: FieldRequirement[], formId: number): ProofDefinition {
  const timestamp = Date.now();
  
  // Group requirements by credential type
  const credentialGroups = new Map<string, FieldRequirement[]>();
  for (const req of requirements) {
    const key = `${req.templateId}`;
    if (!credentialGroups.has(key)) {
      credentialGroups.set(key, []);
    }
    credentialGroups.get(key)!.push(req);
  }

  const requestedCredentials = Array.from(credentialGroups.entries()).map(([templateId, reqs]) => {
    // Get the first requirement to get credential info
    const firstReq = reqs[0];
    
    return {
      credentialType: `Credential Template ${templateId}`,
      attributes: reqs.map(r => r.attribute),
      restrictions: [{
        credDefId: firstReq.credDefId,
        issuerDid: firstReq.issuerDid
      }]
    };
  });

  return {
    name: `vcfb-form${formId}-v${timestamp}`,
    description: `Auto-generated proof definition for form ${formId}`,
    requestedCredentials
  };
}

async function createProofDefinitionIfMissing(formId: number): Promise<string> {
  const cacheKey = `form-${formId}`;
  
  // Check cache first
  if (proofDefinitionCache.has(cacheKey)) {
    return proofDefinitionCache.get(cacheKey)!;
  }

  const client = getVerifierClient();
  const requirements = await buildRequirements(formId);
  
  if (requirements.length === 0) {
    throw new Error('No VC fields found in form');
  }

  // Create proof definition
  const definition = makeOrbitProofDefinition(requirements, formId);
  console.log('[createProofDefinitionIfMissing] Creating definition:', definition.name);
  
  const response = await client.createProofDefinition(definition);
  
  // Cache the proof definition ID
  proofDefinitionCache.set(cacheKey, response.proofDefinitionId);
  
  return response.proofDefinitionId;
}

// Initialize proof request (Step 1: Create proof definition, Step 2: Create proof request)
router.post('/init', async (req, res) => {
  try {
    const { formId } = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'formId is required' });
    }

    console.log('[POST /init] Starting proof initialization for form:', formId);

    // Step 1: Create proof definition if missing (or get cached one)
    const proofDefinitionId = await createProofDefinitionIfMissing(formId);
    console.log('[POST /init] Proof definition ID:', proofDefinitionId);

    // Step 2: Create proof request instance
    const client = getVerifierClient();
    const proofRequest: ProofRequest = {
      proofDefinitionId,
      expiresIn: 600, // 10 minutes
      binding: {
        type: 'Connection'
      }
    };

    const proofRequestResponse = await client.createProofRequest(proofRequest);
    console.log('[POST /init] Proof request created:', proofRequestResponse.proofRequestId);

    // Cache the relationship for 5 minutes
    proofRequestCache.set(proofRequestResponse.proofRequestId, {
      formId,
      proofRequestId: proofRequestResponse.proofRequestId,
      ts: Date.now()
    });
    
    res.json({ proofRequestId: proofRequestResponse.proofRequestId });
  } catch (error: any) {
    console.error('Proof initialization error:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize proof request' });
  }
});

// QR code cache with 5-minute TTL
const cache = new Map<string, { qrSvg: string; inviteUrl: string; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

// Get QR code for proof request (Step 3: Get QR code and invite URL)
router.get('/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[GET /:id/qr] Getting QR for proof request:', id);
    
    // Check cache first
    const cached = cache.get(id);
    if (cached && Date.now() - cached.ts < TTL) {
      console.log('[GET /:id/qr] Returning cached QR for proof request:', id);
      return res.json({ qrSvg: cached.qrSvg, inviteUrl: cached.inviteUrl });
    }

    // Call Orbit to get QR code and invite URL
    const client = getVerifierClient();
    const urlResponse = await client.getProofRequestUrl(id);
    console.log('[GET /:id/qr] Orbit response received for:', id);
    
    // Map response to expected format
    const result = {
      qrSvg: urlResponse.qrSvg,
      inviteUrl: urlResponse.oobUrl
    };
    
    // Cache the result
    cache.set(id, { ...result, ts: Date.now() });
    
    res.json(result);
  } catch (error: any) {
    console.error('[GET /:id/qr] Error:', error.message);
    
    if (error.name === 'HTTPError' && error.response?.status === 404) {
      return res.status(404).json({ error: 'Proof request expired or not found' });
    }
    
    res.status(502).json({ error: 'Orbit prepare-url failed' });
  }
});

// Get proof request status (Step 4: Check proof request status)
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[GET /:id/status] Getting status for proof request:', id);
    
    const client = getVerifierClient();
    const statusResponse = await client.getProofRequestStatus(id);
    
    // Map response to expected format
    const result = {
      status: statusResponse.status,
      attributes: statusResponse.presentation
    };
    
    console.log('[GET /:id/status] Status result:', result);
    res.json(result);
  } catch (error: any) {
    console.error('[GET /:id/status] Error:', error.message);
    
    if (error.name === 'HTTPError' && error.response?.status === 404) {
      return res.status(404).json({ error: 'Proof request not found' });
    }
    
    res.status(502).json({ error: 'Failed to get proof status from Orbit' });
  }
});

// Server-Sent Events endpoint for real-time proof status monitoring
router.get('/:id/stream', async (req, res) => {
  console.log(`Setting up SSE stream for proof request: ${req.params.id}`);
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const { id } = req.params;
  let pollInterval: NodeJS.Timeout;
  
  const poll = async () => {
    try {
      console.log(`[SSE] Polling status for proof request: ${id}`);
      const client = getVerifierClient();
      const statusResponse = await client.getProofRequestStatus(id);
      
      if (statusResponse.status === 'presentation_verified' && statusResponse.presentation) {
        console.log(`[SSE] Proof request ${id} verified with presentation:`, statusResponse.presentation);
        
        // Send success event with attributes
        res.write(`event: done\ndata: ${JSON.stringify(statusResponse.presentation)}\n\n`);
        clearInterval(pollInterval);
        res.end();
      } else if (statusResponse.status === 'presentation_received') {
        console.log(`[SSE] Proof request ${id} received, awaiting verification`);
        // Send status update
        res.write(`event: status\ndata: ${JSON.stringify({ status: 'verifying' })}\n\n`);
      } else {
        console.log(`[SSE] Proof request ${id} status: ${statusResponse.status}`);
        // Send status update
        res.write(`event: status\ndata: ${JSON.stringify({ status: statusResponse.status })}\n\n`);
      }
    } catch (error: any) {
      console.error('[SSE] Status poll error for proof request', id, ':', error.message);
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Status check failed' })}\n\n`);
      clearInterval(pollInterval);
      res.end();
    }
  };

  // Start polling every 2.5 seconds
  pollInterval = setInterval(poll, 2500);
  
  // Initial poll
  poll();

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`SSE stream closed for proof request: ${id}`);
    clearInterval(pollInterval);
    res.end();
  });
});

export default router;