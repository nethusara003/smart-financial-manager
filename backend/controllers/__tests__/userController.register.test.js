import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { registerUser, loginUser } from '../../controllers/userController.js';

describe('User Controller Additional Coverage Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('registerUser', () => {
    it('should successfully register a new user with hashed password', async () => {
      req.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedpassword123');
      User.create = jest.fn().mockResolvedValue({
        _id: 'newuser123',
        name: 'New User',
        email: 'newuser@example.com'
      });

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'hashedpassword123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'newuser123',
        name: 'New User',
        email: 'newuser@example.com'
      });
    });

    it('should handle registration database errors gracefully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });

    it('should handle bcrypt hashing errors', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockRejectedValue(new Error('Hashing failed'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Hashing failed' });
    });
  });

  describe('loginUser', () => {
    it('should return token and user details with currency on successful login', async () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'user@example.com',
        role: 'user',
        currency: 'USD',
        password: 'hashedpassword'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('testtoken123');

      process.env.JWT_SECRET = 'test-secret';

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', role: 'user' },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user123',
        name: 'Test User',
        email: 'user@example.com',
        role: 'user',
        currency: 'USD',
        token: 'testtoken123'
      });
    });

    it('should default to LKR currency if user has no currency set', async () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'user@example.com',
        role: 'user',
        password: 'hashedpassword'
        // No currency field
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('testtoken123');

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        currency: 'LKR'
      }));
    });

    it('should handle login database errors', async () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockRejectedValue(new Error('DB connection error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB connection error' });
    });
  });
});
