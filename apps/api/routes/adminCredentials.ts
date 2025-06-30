import { Router } from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import { storage } from '../storage.js';
import { insertCredentialTemplateSchema } from '../../../packages/shared/schema';

const router = Router();
router.use(isAdmin);

// Get all credential templates for admin
router.get('/', async (req, res) => {
  try {
    const templates = await storage.listCredentialTemplates();
    // Sort by updated timestamp descending (newest first)
    templates.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    res.json(templates);
  } catch (error) {
    console.error('Error fetching credential templates:', error);
    res.status(500).json({ error: 'Failed to fetch credential templates' });
  }
});

// Create new credential template
router.post('/', async (req, res) => {
  try {
    const validated = insertCredentialTemplateSchema.parse(req.body);
    const template = await storage.createCredentialTemplate(validated);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating credential template:', error);
    res.status(400).json({ error: 'Invalid credential template data' });
  }
});

// Update credential template
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validated = insertCredentialTemplateSchema.partial().parse(req.body);
    const template = await storage.updateCredentialTemplate(id, validated);
    
    if (!template) {
      return res.status(404).json({ error: 'Credential template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error updating credential template:', error);
    res.status(400).json({ error: 'Invalid credential template data' });
  }
});

// Delete credential template
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteCredentialTemplate(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Credential template not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting credential template:', error);
    res.status(500).json({ error: 'Failed to delete credential template' });
  }
});

// Health check endpoint to restore missing credentials
router.post('/health', async (req, res) => {
  try {
    // Re-run credential seeding to restore any missing templates
    const { ensureLawyerCred } = await import('../ensureLawyerCred.js');
    await ensureLawyerCred();
    res.status(204).send();
  } catch (error) {
    console.error('Error running health check:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

export default router;