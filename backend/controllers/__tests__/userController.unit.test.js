import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { registerUser, loginUser, guestLogin } from '../../controllers/userController.js';

const mockFindOneWithSelect = (result, isRejected = false) => {
  const select = isRejected
    ? jest.fn().mockRejectedValue(result)
    : jest.fn().mockResolvedValue(result);

  User.findOne = jest.fn().mockReturnValue({ select });
  return select;
};

describe('User Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue({ email: 'existing@example.com' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        currency: 'USD'
      };

      mockFindOneWithSelect(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('mockToken');
      process.env.JWT_SECRET = 'test-secret';

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'user123',
        token: 'mockToken'
      }));
    });

    it('should return 400 with invalid email', async () => {
      req.body = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      mockFindOneWithSelect(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 400 with invalid password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      mockFindOneWithSelect(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('guestLogin', () => {
    it('should create a guest session', async () => {
      jwt.sign = jest.fn().mockReturnValue('guestToken');

      await guestLogin(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        role: 'guest',
        token: 'guestToken',
        name: 'Guest User',
        email: 'guest@example.com'
      }));
    });
  });
});
