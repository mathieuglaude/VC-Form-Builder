import { Request, Response, Router } from 'express';
import { ocaService } from '../services/OCAService';

/**
 * OCA Bundle API Routes
 * Handles fetching, caching, and serving OCA bundle data
 */

const router = Router();

/**
 * GET /api/oca/credentials/:id/branding
 * Get OCA branding data for a specific credential
 */
router.get('/credentials/:id/branding', async (req: Request, res: Response) => {
  try {
    const credentialId = parseInt(req.params.id);
    if (isNaN(credentialId)) {
      return res.status(400).json({ error: 'Invalid credential ID' });
    }

    // First try to get cached branding
    let branding = await ocaService.getCachedBranding(credentialId);
    
    // If no cached branding, try to fetch fresh
    if (!branding) {
      try {
        branding = await ocaService.fetchOCABundleForCredential(credentialId);
      } catch (error) {
        console.warn(`Failed to fetch OCA bundle for credential ${credentialId}:`, error);
        return res.status(404).json({ error: 'OCA bundle not found for this credential' });
      }
    }

    res.json(branding);
  } catch (error) {
    console.error('Error getting OCA branding:', error);
    res.status(500).json({ error: 'Failed to get OCA branding data' });
  }
});

/**
 * POST /api/oca/credentials/:id/refresh
 * Force refresh OCA bundle data for a credential
 */
router.post('/credentials/:id/refresh', async (req: Request, res: Response) => {
  try {
    const credentialId = parseInt(req.params.id);
    if (isNaN(credentialId)) {
      return res.status(400).json({ error: 'Invalid credential ID' });
    }

    const branding = await ocaService.refreshOCABundle(credentialId);
    
    if (!branding) {
      return res.status(404).json({ error: 'No OCA bundle found for this credential' });
    }

    res.json(branding);
  } catch (error) {
    console.error('Error refreshing OCA bundle:', error);
    res.status(500).json({ error: 'Failed to refresh OCA bundle' });
  }
});

/**
 * POST /api/oca/refresh-all
 * Refresh OCA bundles for all credentials
 */
router.post('/refresh-all', async (req: Request, res: Response) => {
  try {
    const results = await ocaService.refreshAllOCABundles();
    res.json(results);
  } catch (error) {
    console.error('Error refreshing all OCA bundles:', error);
    res.status(500).json({ error: 'Failed to refresh OCA bundles' });
  }
});

/**
 * GET /api/oca/repositories
 * Get available OCA repositories
 */
router.get('/repositories', async (req: Request, res: Response) => {
  try {
    const repositories = ocaService.getAvailableRepositories();
    res.json(repositories);
  } catch (error) {
    console.error('Error getting repositories:', error);
    res.status(500).json({ error: 'Failed to get repositories' });
  }
});

/**
 * POST /api/oca/repositories
 * Add a new OCA repository
 */
router.post('/repositories', async (req: Request, res: Response) => {
  try {
    const { id, name, baseUrl, type } = req.body;
    
    if (!id || !name || !baseUrl || !type) {
      return res.status(400).json({ error: 'Missing required fields: id, name, baseUrl, type' });
    }

    if (!['github', 'direct'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "github" or "direct"' });
    }

    ocaService.addRepository({ id, name, baseUrl, type });
    res.json({ message: 'Repository added successfully' });
  } catch (error) {
    console.error('Error adding repository:', error);
    res.status(500).json({ error: 'Failed to add repository' });
  }
});

/**
 * POST /api/oca/test-url
 * Test an OCA bundle URL for validity
 */
router.post('/test-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await ocaService.testOCABundleUrl(url);
    res.json(result);
  } catch (error) {
    console.error('Error testing OCA URL:', error);
    res.status(500).json({ error: 'Failed to test OCA URL' });
  }
});

/**
 * GET /api/oca/preview/:credentialId
 * Get OCA branding with sample credential data for preview
 */
router.get('/preview/:credentialId', async (req: Request, res: Response) => {
  try {
    const credentialId = parseInt(req.params.credentialId);
    if (isNaN(credentialId)) {
      return res.status(400).json({ error: 'Invalid credential ID' });
    }

    const branding = await ocaService.getCachedBranding(credentialId);
    if (!branding) {
      return res.status(404).json({ error: 'No OCA branding found for this credential' });
    }

    // Generate sample credential data based on primary/secondary attributes
    const sampleData: Record<string, string> = {};
    
    if (branding.primary_attribute) {
      sampleData[branding.primary_attribute] = 'John Doe';
    }
    
    if (branding.secondary_attribute) {
      sampleData[branding.secondary_attribute] = 'Software Engineer';
    }
    
    if (branding.issued_date_attribute) {
      sampleData[branding.issued_date_attribute] = '2024-01-15';
    }
    
    if (branding.expiry_date_attribute) {
      sampleData[branding.expiry_date_attribute] = '2025-01-15';
    }

    // Add common attributes for better previews
    sampleData.given_names = sampleData.given_names || 'John';
    sampleData.family_name = sampleData.family_name || 'Doe';
    sampleData.member_status = sampleData.member_status || 'Active';

    res.json({
      branding,
      sampleData,
      variants: ['banner-bottom', 'banner-top', 'full-background', 'minimal']
    });
  } catch (error) {
    console.error('Error getting OCA preview:', error);
    res.status(500).json({ error: 'Failed to get OCA preview' });
  }
});

export default router;