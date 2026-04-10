import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../../middleware/requireAuth.js';

describe('requireAuth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      requestId: 'req-test-123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('should return 401 if no authorization header', () => {
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided',
      requestId: 'req-test-123'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', () => {
    req.headers.authorization = 'InvalidToken xyz';

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided',
      requestId: 'req-test-123'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate valid token for regular user', () => {
    const token = jwt.sign({ id: 'user123', role: 'user' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: 'user123',
      _id: 'user123',
      role: 'user',
      isGuest: false
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should authenticate valid token for guest user', () => {
    const token = jwt.sign({ sessionId: 'guest123', role: 'guest' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: 'guest123',
      _id: 'guest123',
      role: 'guest',
      isGuest: true,
      sessionId: 'guest123'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token',
      requestId: 'req-test-123'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', () => {
    const token = jwt.sign({ id: 'user123', role: 'user' }, 'test-secret-key', { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token',
      requestId: 'req-test-123'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate admin user', () => {
    const token = jwt.sign({ id: 'admin123', role: 'admin' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(req.user.role).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('should authenticate super_admin user', () => {
    const token = jwt.sign({ id: 'superadmin123', role: 'super_admin' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);

    expect(req.user.role).toBe('super_admin');
    expect(next).toHaveBeenCalled();
  });
});
