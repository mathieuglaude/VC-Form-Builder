import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { seedLSBCCredentialWithAssets } from '../../apps/api/seedCredentials';

// Mock dependencies
const mockStorage = {
  getAllCredentials: vi.fn(),
  createCredential: vi.fn(),
};

const mockOcaAssets = {
  fetchOCABundle: vi.fn(),
  downloadAsset: vi.fn(),
};

const mockFs = {
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
};

vi.mock('../../apps/api/storage', () => ({ storage: mockStorage }));
vi.mock('../../apps/api/ocaAssets', () => mockOcaAssets);
vi.mock('fs', () => mockFs);

describe('seedCredentials', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mocks
    mockStorage.getAllCredentials.mockResolvedValue([]);
    mockOcaAssets.fetchOCABundle.mockResolvedValue({
      branding: {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#00698c',
        layout: 'banner-bottom'
      },
      metaOverlay: {
        issuer: 'Law Society of British Columbia (LSBC)',
        description: 'Official lawyer credential'
      }
    });
    mockOcaAssets.downloadAsset.mockResolvedValue('base64encodedimage');
    mockFs.existsSync.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('seedLSBCCredentialWithAssets', () => {
    it('creates LSBC credential when none exists', async () => {
      mockStorage.createCredential.mockResolvedValue({
        id: 1,
        label: 'BC Lawyer Credential v1'
      });

      await seedLSBCCredentialWithAssets();

      expect(mockStorage.getAllCredentials).toHaveBeenCalled();
      expect(mockOcaAssets.fetchOCABundle).toHaveBeenCalledWith(
        'https://bcgov.github.io/digital-trust-toolkit/docs/governance/pilot-projects/bc-attorney/oca-bundle.json'
      );
      expect(mockStorage.createCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'BC Lawyer Credential v1',
          issuerName: 'Law Society of British Columbia (LSBC)',
          ecosystem: 'BC Ecosystem',
          interopProfile: 'AIP 2.0',
          schemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0'
        })
      );
    });

    it('skips creation when LSBC credential already exists', async () => {
      mockStorage.getAllCredentials.mockResolvedValue([
        { id: 1, label: 'BC Lawyer Credential v1' }
      ]);

      await seedLSBCCredentialWithAssets();

      expect(mockStorage.getAllCredentials).toHaveBeenCalled();
      expect(mockStorage.createCredential).not.toHaveBeenCalled();
    });

    it('downloads and saves OCA assets when missing', async () => {
      mockOcaAssets.fetchOCABundle.mockResolvedValue({
        branding: {
          logoUrl: 'https://example.com/logo.png',
          backgroundImage: 'https://example.com/bg.png'
        },
        metaOverlay: {
          issuer: 'Test Issuer'
        }
      });

      await seedLSBCCredentialWithAssets();

      expect(mockOcaAssets.downloadAsset).toHaveBeenCalledWith('https://example.com/logo.png');
      expect(mockOcaAssets.downloadAsset).toHaveBeenCalledWith('https://example.com/bg.png');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('public/oca-assets/lsbc', { recursive: true });
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it('skips asset download when files already exist', async () => {
      mockFs.existsSync.mockReturnValue(true);

      await seedLSBCCredentialWithAssets();

      expect(mockOcaAssets.downloadAsset).not.toHaveBeenCalled();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('handles OCA bundle fetch errors gracefully', async () => {
      mockOcaAssets.fetchOCABundle.mockRejectedValue(new Error('Network error'));

      await expect(seedLSBCCredentialWithAssets()).rejects.toThrow('Network error');
      expect(mockStorage.createCredential).not.toHaveBeenCalled();
    });

    it('handles asset download errors gracefully', async () => {
      mockOcaAssets.downloadAsset.mockRejectedValue(new Error('Download failed'));

      await expect(seedLSBCCredentialWithAssets()).rejects.toThrow('Download failed');
    });

    it('creates credential with proper attributes', async () => {
      await seedLSBCCredentialWithAssets();

      expect(mockStorage.createCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: [
            'given_name',
            'surname', 
            'public_person_id',
            'member_status',
            'member_status_code',
            'credential_type'
          ],
          walletRestricted: true,
          compatibleWallets: ['BC Wallet'],
          isPredefined: true
        })
      );
    });

    it('handles missing branding data gracefully', async () => {
      mockOcaAssets.fetchOCABundle.mockResolvedValue({
        branding: {},
        metaOverlay: {
          issuer: 'Test Issuer'
        }
      });

      await seedLSBCCredentialWithAssets();

      expect(mockStorage.createCredential).toHaveBeenCalled();
      expect(mockOcaAssets.downloadAsset).not.toHaveBeenCalled();
    });

    it('handles file system errors during asset saving', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(seedLSBCCredentialWithAssets()).rejects.toThrow('Permission denied');
    });
  });
});