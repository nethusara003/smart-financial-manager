import { describe, it, expect } from 'vitest';
import { buildQueryString, getAuthHeaders, handleApiError } from '../apiHelpers.js';

describe('API Utilities', () => {
  describe('buildQueryString', () => {
    it('should build query string from params object', () => {
      const params = { page: 1, limit: 10, sort: 'date' };
      expect(buildQueryString(params)).toBe('page=1&limit=10&sort=date');
    });

    it('should filter out null and undefined values', () => {
      const params = { page: 1, filter: null, search: undefined };
      expect(buildQueryString(params)).toBe('page=1');
    });

    it('should filter out empty strings', () => {
      const params = { page: 1, search: '' };
      expect(buildQueryString(params)).toBe('page=1');
    });

    it('should encode special characters', () => {
      const params = { search: 'test & value', category: 'Food & Drink' };
      expect(buildQueryString(params)).toContain('test%20%26%20value');
    });

    it('should handle empty params', () => {
      expect(buildQueryString({})).toBe('');
    });

    it('should handle boolean values', () => {
      const params = { active: true, deleted: false };
      expect(buildQueryString(params)).toBe('active=true&deleted=false');
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with token', () => {
      const token = 'abc123';
      const headers = getAuthHeaders(token);
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer abc123');
    });

    it('should return headers without Authorization when no token', () => {
      const headers = getAuthHeaders(null);
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should handle empty string token', () => {
      const headers = getAuthHeaders('');
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('handleApiError', () => {
    it('should handle response errors', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      };

      const result = handleApiError(error);
      expect(result.message).toBe('Bad request');
      expect(result.status).toBe(400);
    });

    it('should handle response error without message', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };

      const result = handleApiError(error);
      expect(result.message).toBe('An error occurred');
      expect(result.status).toBe(500);
    });

    it('should handle request errors (no response)', () => {
      const error = {
        request: {}
      };

      const result = handleApiError(error);
      expect(result.message).toBe('No response from server');
      expect(result.status).toBe(0);
    });

    it('should handle generic errors', () => {
      const error = {
        message: 'Network error'
      };

      const result = handleApiError(error);
      expect(result.message).toBe('Network error');
      expect(result.status).toBe(-1);
    });

    it('should handle errors without message', () => {
      const error = {};

      const result = handleApiError(error);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.status).toBe(-1);
    });
  });
});
