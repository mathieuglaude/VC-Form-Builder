import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostgresStorage } from '../../apps/api/storage';

// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn(),
};

vi.mock('../../apps/api/db', () => ({ db: mockDb }));

describe('PostgresStorage', () => {
  let storage: PostgresStorage;

  beforeEach(() => {
    storage = new PostgresStorage();
    vi.resetAllMocks();
    
    // Chain all mock methods to return this
    Object.keys(mockDb).forEach(key => {
      if (typeof mockDb[key] === 'function' && key !== 'eq') {
        mockDb[key].mockReturnValue(mockDb);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Forms', () => {
    const mockForm = {
      id: 1,
      name: 'Test Form',
      slug: 'test-form',
      formSchema: { components: [] },
      isPublic: false,
      authorId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('getAllForms returns forms list', async () => {
      mockDb.orderBy.mockResolvedValue([mockForm]);
      
      const result = await storage.getAllForms();
      
      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([mockForm]);
    });

    it('getFormById returns specific form', async () => {
      mockDb.where.mockResolvedValue([mockForm]);
      
      const result = await storage.getFormById(1);
      
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toEqual(mockForm);
    });

    it('getFormById returns null when not found', async () => {
      mockDb.where.mockResolvedValue([]);
      
      const result = await storage.getFormById(999);
      
      expect(result).toBeNull();
    });

    it('getFormBySlug returns form by slug', async () => {
      mockDb.where.mockResolvedValue([mockForm]);
      
      const result = await storage.getFormBySlug('test-form');
      
      expect(result).toEqual(mockForm);
    });

    it('createForm inserts new form', async () => {
      const newForm = {
        name: 'New Form',
        slug: 'new-form',
        formSchema: { components: [] }
      };
      
      mockDb.returning.mockResolvedValue([{ id: 2, ...newForm }]);
      
      const result = await storage.createForm(newForm);
      
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(newForm);
      expect(result).toEqual({ id: 2, ...newForm });
    });

    it('updateForm modifies existing form', async () => {
      const updates = { name: 'Updated Form' };
      mockDb.returning.mockResolvedValue([{ ...mockForm, ...updates }]);
      
      const result = await storage.updateForm(1, updates);
      
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(updates);
      expect(result).toBeTruthy();
    });

    it('deleteForm removes form', async () => {
      const result = await storage.deleteForm(1);
      
      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Credentials', () => {
    const mockCredential = {
      id: 1,
      label: 'Test Credential',
      schemaId: 'test:schema:1.0',
      attributes: ['name', 'age'],
      issuerName: 'Test Issuer',
      ecosystem: 'Test Ecosystem',
      interopProfile: 'AIP 2.0'
    };

    it('getAllCredentials returns credentials list', async () => {
      mockDb.orderBy.mockResolvedValue([mockCredential]);
      
      const result = await storage.getAllCredentials();
      
      expect(result).toEqual([mockCredential]);
    });

    it('getCredentialById returns specific credential', async () => {
      mockDb.where.mockResolvedValue([mockCredential]);
      
      const result = await storage.getCredentialById(1);
      
      expect(result).toEqual(mockCredential);
    });

    it('createCredential inserts new credential', async () => {
      const newCredential = {
        label: 'New Credential',
        schemaId: 'new:schema:1.0',
        attributes: ['email']
      };
      
      mockDb.returning.mockResolvedValue([{ id: 2, ...newCredential }]);
      
      const result = await storage.createCredential(newCredential);
      
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual({ id: 2, ...newCredential });
    });

    it('updateCredential modifies existing credential', async () => {
      const updates = { label: 'Updated Credential' };
      mockDb.returning.mockResolvedValue([{ ...mockCredential, ...updates }]);
      
      const result = await storage.updateCredential(1, updates);
      
      expect(result).toBeTruthy();
    });

    it('deleteCredential removes credential', async () => {
      const result = await storage.deleteCredential(1);
      
      expect(result).toBe(true);
    });
  });

  describe('Submissions', () => {
    const mockSubmission = {
      id: 1,
      formId: 1,
      data: { name: 'John Doe', age: 30 },
      verifiedData: { birthdate: '1993-01-01' },
      submittedAt: new Date()
    };

    it('getSubmissions returns submissions for form', async () => {
      mockDb.where.mockResolvedValue([mockSubmission]);
      
      const result = await storage.getSubmissions(1);
      
      expect(result).toEqual([mockSubmission]);
    });

    it('createSubmission inserts new submission', async () => {
      const newSubmission = {
        formId: 1,
        data: { name: 'Jane Doe' },
        verifiedData: {}
      };
      
      mockDb.returning.mockResolvedValue([{ id: 2, ...newSubmission }]);
      
      const result = await storage.createSubmission(newSubmission);
      
      expect(result).toEqual({ id: 2, ...newSubmission });
    });
  });

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));
      
      await expect(storage.getAllForms()).rejects.toThrow('Database error');
    });

    it('handles connection issues', async () => {
      mockDb.where.mockRejectedValue(new Error('Connection failed'));
      
      await expect(storage.getFormById(1)).rejects.toThrow('Connection failed');
    });
  });
});