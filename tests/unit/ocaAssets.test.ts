import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadAsset, fetchOCABundle } from '../../apps/api/ocaAssets';

describe('OCA Assets Module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadAsset', () => {
    it('downloads asset and returns base64 string', async () => {
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10))
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      
      const result = await downloadAsset('https://example.com/asset.png');
      
      expect(fetch).toHaveBeenCalledWith('https://example.com/asset.png');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('throws error on failed download', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });
      
      await expect(downloadAsset('https://example.com/missing.png'))
        .rejects.toThrow('Failed to download asset');
    });
  });

  describe('fetchOCABundle', () => {
    it('fetches and parses OCA bundle successfully', async () => {
      const mockBundle = {
        overlays: [
          { type: 'oca/branding/1.0', primary_background_color: '#ffffff' },
          { type: 'oca/label/1.0', attribute_labels: { name: 'Name' } }
        ]
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBundle)
      });
      
      const result = await fetchOCABundle('https://example.com/bundle.json');
      
      expect(fetch).toHaveBeenCalledWith('https://example.com/bundle.json');
      expect(result.branding).toBeDefined();
      expect(result.metaOverlay).toBeDefined();
    });

    it('handles bundle without branding overlay', async () => {
      const mockBundle = {
        overlays: [
          { type: 'oca/label/1.0', attribute_labels: { name: 'Name' } }
        ]
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBundle)
      });
      
      const result = await fetchOCABundle('https://example.com/bundle.json');
      
      expect(result.branding).toBeDefined();
      expect(result.metaOverlay).toBeDefined();
    });

    it('throws error on failed bundle fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });
      
      await expect(fetchOCABundle('https://example.com/bundle.json'))
        .rejects.toThrow('Failed to fetch OCA bundle');
    });
  });
});