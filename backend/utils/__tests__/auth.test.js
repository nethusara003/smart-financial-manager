import { describe, it, expect, beforeAll } from '@jest/globals';
import { generateTestToken } from '../../test/utils.js';
import jwt from 'jsonwebtoken';

describe('Auth Utilities', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('generateTestToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'test-user-123';
      const token = generateTestToken(userId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should encode user ID in the token', () => {
      const userId = 'test-user-456';
      const token = generateTestToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.id).toBe(userId);
    });

    it('should create token with expiration', () => {
      const userId = 'test-user-789';
      const token = generateTestToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });
});
