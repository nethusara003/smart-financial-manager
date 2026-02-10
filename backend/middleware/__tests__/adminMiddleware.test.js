import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { adminMiddleware } from '../../middleware/adminMiddleware.js';

describe('adminMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should allow admin user', () => {
    req.user.role = 'admin';
    
    adminMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow super_admin user', () => {
    req.user.role = 'super_admin';
    
    adminMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block regular user', () => {
    req.user.role = 'user';
    
    adminMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should block user with invalid role', () => {
    req.user.role = 'invalid';
    
    adminMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
