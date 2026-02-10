import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function createTestUser(userData = {}) {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...userData
  };
  
  const user = await User.create(defaultUser);
  return user;
}

export function generateTestToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

export async function createAuthenticatedUser() {
  const user = await createTestUser();
  const token = generateTestToken(user._id);
  return { user, token };
}
