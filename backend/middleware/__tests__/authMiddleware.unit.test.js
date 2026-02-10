import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { protect } from '../../middleware/authMiddleware.js';

describe('authMiddleware (protect)', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key';  });

  it('should return 401 if no token provided', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'InvalidFormat token123';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate valid token for regular user', async () => {
    const token = jwt.sign({ id: 'user123', role: 'user' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };

    const mockUserQuery = {
      select: jest.fn().mockResolvedValue(mockUser)
    };

    User.findById = jest.fn().mockReturnValue(mockUserQuery);

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(mockUserQuery.select).toHaveBeenCalledWith('-password');
    expect(req.user).toEqual({ ...mockUser, isGuest: false });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should authenticate valid token for guest user', async () => {
    const token = jwt.sign({ sessionId: 'guest123', role: 'guest' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    await protect(req, res, next);

    expect(req.user).toEqual({
      _id: 'guest123',
      id: 'guest123',
      role: 'guest',
      isGuest: true,
      sessionId: 'guest123'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found in database', async () => {
    const token = jwt.sign({ id: 'nonexistent123', role: 'user' }, 'test-secret-key');
    req.headers.authorization = `Bearer ${token}`;

    const mockUserQuery = {
      select: jest.fn().mockResolvedValue(null)
    };

    User.findById = jest.fn().mockReturnValue(mockUserQuery);

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', async () => {
    req.headers.authorization = 'Bearer invalid-token-xyz';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', async () => {
    const token = jwt.sign({ id: 'user123', role: 'user' }, 'test-secret-key', { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${token}`;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });
});
