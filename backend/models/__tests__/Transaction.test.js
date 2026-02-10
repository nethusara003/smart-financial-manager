import { describe, it, expect, beforeAll } from '@jest/globals';
import mongoose from 'mongoose';
import Transaction from '../../models/Transaction.js';
import User from '../../models/User.js';

let testUser;

beforeAll(async () => {
  // Create a test user (mongoose connection already established in test/setup.js)
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
  });
});

describe('Transaction Model Tests', () => {
  it('should create a transaction successfully', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50.00,
      note: 'Lunch at restaurant',
      date: new Date('2024-01-15'),
    };

    const transaction = await Transaction.create(transactionData);

    expect(transaction._id).toBeDefined();
    expect(transaction.user.toString()).toBe(testUser._id.toString());
    expect(transaction.type).toBe('expense');
    expect(transaction.category).toBe('Food');
    expect(transaction.amount).toBe(50);
    expect(transaction.note).toBe('Lunch at restaurant');
    expect(transaction.createdAt).toBeDefined();
    expect(transaction.updatedAt).toBeDefined();
  });

  it('should create an income transaction', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'income',
      category: 'Salary',
      amount: 3000.00,
    };

    const transaction = await Transaction.create(transactionData);

    expect(transaction.type).toBe('income');
    expect(transaction.category).toBe('Salary');
    expect(transaction.amount).toBe(3000);
  });

  it('should require user field', async () => {
    const transactionData = {
      type: 'expense',
      category: 'Food',
      amount: 50,
    };

    await expect(Transaction.create(transactionData)).rejects.toThrow();
  });

  it('should require type field', async () => {
    const transactionData = {
      user: testUser._id,
      category: 'Food',
      amount: 50,
    };

    await expect(Transaction.create(transactionData)).rejects.toThrow();
  });

  it('should require category field', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'expense',
      amount: 50,
    };

    await expect(Transaction.create(transactionData)).rejects.toThrow();
  });

  it('should require amount field', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'expense',
      category: 'Food',
    };

    await expect(Transaction.create(transactionData)).rejects.toThrow();
  });

  it('should only accept income or expense as type', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'invalid-type',
      category: 'Food',
      amount: 50,
    };

    await expect(Transaction.create(transactionData)).rejects.toThrow();
  });

  it('should set default date if not provided', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    };

    const transaction = await Transaction.create(transactionData);
    expect(transaction.date).toBeDefined();
    expect(transaction.date).toBeInstanceOf(Date);
  });

  it('should allow optional note field', async () => {
    const transactionData = {
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    };

    const transaction = await Transaction.create(transactionData);
    expect(transaction.note).toBeUndefined();
  });

  it('should update transaction successfully', async () => {
    const transaction = await Transaction.create({
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    });

    transaction.amount = 75;
    transaction.note = 'Updated note';
    await transaction.save();

    const updated = await Transaction.findById(transaction._id);
    expect(updated.amount).toBe(75);
    expect(updated.note).toBe('Updated note');
  });

  it('should delete transaction successfully', async () => {
    const transaction = await Transaction.create({
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    });

    await Transaction.deleteOne({ _id: transaction._id });

    const found = await Transaction.findById(transaction._id);
    expect(found).toBeNull();
  });

  it('should find transactions by user', async () => {
    const user2 = await User.create({
      name: 'User 2',
      email: 'user2@example.com',
      password: 'password123',
    });

    await Transaction.create([
      { user: testUser._id, type: 'expense', category: 'Food', amount: 50 },
      { user: testUser._id, type: 'income', category: 'Salary', amount: 3000 },
      { user: user2._id, type: 'expense', category: 'Food', amount: 30 },
    ]);

    const userTransactions = await Transaction.find({ user: testUser._id });
    expect(userTransactions).toHaveLength(2);
  });

  it('should have user reference as ObjectId', async () => {
    const transaction = await Transaction.create({
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    });

    expect(transaction.user).toBeDefined();
    expect(transaction.user.toString()).toBe(testUser._id.toString());
  });

  it('should handle decimal amounts correctly', async () => {
    const transaction = await Transaction.create({
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 10.99,
    });

    expect(transaction.amount).toBe(10.99);
  });

  it('should track timestamps', async () => {
    const before = new Date();
    
    const transaction = await Transaction.create({
      user: testUser._id,
      type: 'expense',
      category: 'Food',
      amount: 50,
    });

    const after = new Date();

    expect(transaction.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(transaction.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(transaction.updatedAt).toBeDefined();
  });
});
