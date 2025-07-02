import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock for URL validation logic
class InvalidInvitationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInvitationError';
  }
}

function validateInvitationUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('didcomm://') && url.length > 'didcomm://'.length) return true;
  if (url.startsWith('https://') && url.length > 'https://'.length) return true;
  return false;
}

function processInvitationUrl(url: string): string {
  const qrValidateEnabled = process.env.QR_VALIDATE === '1';
  
  if (qrValidateEnabled && !validateInvitationUrl(url)) {
    throw new InvalidInvitationError(`Invalid invitation URL format: ${url}`);
  }
  
  return url;
}

describe('URL Validation Logic', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.QR_VALIDATE;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.QR_VALIDATE = originalEnv;
    } else {
      delete process.env.QR_VALIDATE;
    }
  });

  describe('when QR_VALIDATE is enabled', () => {
    beforeEach(() => {
      process.env.QR_VALIDATE = '1';
    });

    it('should accept valid didcomm:// URLs', () => {
      const validUrl = 'didcomm://example.com/invitation';
      
      expect(() => processInvitationUrl(validUrl)).not.toThrow();
      expect(processInvitationUrl(validUrl)).toBe(validUrl);
    });

    it('should accept valid https:// URLs', () => {
      const validUrl = 'https://example.com/invitation';
      
      expect(() => processInvitationUrl(validUrl)).not.toThrow();
      expect(processInvitationUrl(validUrl)).toBe(validUrl);
    });

    it('should reject empty URLs', () => {
      expect(() => processInvitationUrl('')).toThrow(InvalidInvitationError);
      expect(() => processInvitationUrl('')).toThrow('Invalid invitation URL format');
    });

    it('should reject undefined URLs', () => {
      expect(() => processInvitationUrl(undefined as any)).toThrow(InvalidInvitationError);
    });

    it('should reject invalid protocol URLs', () => {
      const invalidUrls = [
        'http://example.com/invitation',
        'ftp://example.com/invitation',
        'file:///path/to/file',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ];

      invalidUrls.forEach(url => {
        expect(() => processInvitationUrl(url)).toThrow(InvalidInvitationError);
        expect(() => processInvitationUrl(url)).toThrow(`Invalid invitation URL format: ${url}`);
      });
    });

    it('should reject malformed URLs', () => {
      const malformedUrls = [
        'just-text',
        'not-a-url',
        '://missing-protocol',
        'https://',
        'didcomm://'
      ];

      malformedUrls.forEach(url => {
        expect(() => processInvitationUrl(url)).toThrow(InvalidInvitationError);
      });
    });
  });

  describe('when QR_VALIDATE is disabled', () => {
    beforeEach(() => {
      delete process.env.QR_VALIDATE;
    });

    it('should accept any URL when validation is disabled', () => {
      const testUrls = [
        'didcomm://example.com/invitation',
        'https://example.com/invitation',
        'http://example.com/invitation',
        'invalid-url',
        '',
        'javascript:alert(1)'
      ];

      testUrls.forEach(url => {
        expect(() => processInvitationUrl(url)).not.toThrow();
        expect(processInvitationUrl(url)).toBe(url);
      });
    });

    it('should handle undefined URLs gracefully when validation is disabled', () => {
      expect(() => processInvitationUrl(undefined as any)).not.toThrow();
      expect(processInvitationUrl(undefined as any)).toBe(undefined);
    });
  });

  describe('validateInvitationUrl helper function', () => {
    it('should correctly identify valid protocols', () => {
      expect(validateInvitationUrl('didcomm://example.com')).toBe(true);
      expect(validateInvitationUrl('https://example.com')).toBe(true);
    });

    it('should correctly identify invalid protocols', () => {
      expect(validateInvitationUrl('http://example.com')).toBe(false);
      expect(validateInvitationUrl('ftp://example.com')).toBe(false);
      expect(validateInvitationUrl('invalid')).toBe(false);
      expect(validateInvitationUrl('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateInvitationUrl('didcomm://')).toBe(false); // missing content after protocol
      expect(validateInvitationUrl('https://')).toBe(false); // missing content after protocol
      expect(validateInvitationUrl('DIDCOMM://example.com')).toBe(false); // case sensitive
      expect(validateInvitationUrl('HTTPS://example.com')).toBe(false); // case sensitive
    });
  });
});