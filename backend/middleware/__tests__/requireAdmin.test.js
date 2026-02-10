import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import requireAdmin from '../../middleware/requireAdmin.js';

describe('requireAdmin Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should allow admin user to proceed', () => {
    req.user.role = 'admin';
    
    requireAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow super_admin user to proceed', () => {
    req.user.role = 'super_admin';
    
    requireAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block regular user', () => {
    req.user.role = 'user';
    
    requireAdmin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should block user with no role', () => {
    req.user = {};
    
    requireAdmin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should block when user is null', () => {
    req.user = null;
    
    requireAdmin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should block when user is undefined', () => {
    req.user = undefined;
    
    requireAdmin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
