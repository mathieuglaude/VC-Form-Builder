import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureLawyerCred } from '../../apps/api/ensureLawyerCred';

// Mock database
const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
};

vi.mock('../../apps/api/db', () => ({
  db: mockDb
}));

describe('ensureLawyerCred', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Setup chain for select query
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.insert.mockReturnValue(mockDb);
    mockDb.values.mockReturnValue(mockDb);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips creation when credential already exists', async () => {
    // Mock existing credential
    mockDb.where.mockResolvedValue([{ id: 1, label: 'BC Lawyer Credential v1' }]);
    
    await ensureLawyerCred();
    
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('creates lawyer credential when it does not exist', async () => {
    // Mock no existing credential
    mockDb.where.mockResolvedValue([]);
    
    await ensureLawyerCred();
    
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      label: 'BC Lawyer Credential v1',
      issuerName: 'Law Society of British Columbia (LSBC)',
      ecosystem: 'BC Ecosystem',
      interopProfile: 'AIP 2.0'
    }));
  });

  it('handles database errors gracefully', async () => {
    mockDb.where.mockRejectedValue(new Error('Database connection failed'));
    
    await expect(ensureLawyerCred()).rejects.toThrow('Database connection failed');
  });
});