import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import Transaction from '../../models/Transaction.js';
import { addTransaction, getTransactions, deleteTransaction, updateTransaction } from '../../controllers/transactionController.js';
import { guestStore } from '../../controllers/userController.js';

describe('Transaction Controller Unit Tests', () => {
  let req, res;
  let userId;

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    req = {
      body: {},
      user: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    guestStore.clear();
  });

  describe('addTransaction', () => {
    it('should create transaction for authenticated user', async () => {
      req.user = { _id: userId, isGuest: false };
      req.body = {
        type: 'expense',
        category: 'Food',
        amount: 50,
        note: 'Lunch',
        date: new Date()
      };

      const mockTransaction = {
        _id: 'trans123',
        user: userId,
        type: 'expense',
        category: 'Food',
        amount: 50
      };

      Transaction.create = jest.fn().mockResolvedValue(mockTransaction);

      await addTransaction(req, res);

      expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        user: userId,
        type: 'expense',
        category: 'Food',
        amount: 50
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should create transaction for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.body = {
        type: 'income',
        category: 'Salary',
        amount: 3000
      };

      guestStore.set(guestId, { transactions: [], goals: [] });

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'income',
        category: 'Salary',
        amount: 3000
      }));

      const guestData = guestStore.get(guestId);
      expect(guestData.transactions).toHaveLength(1);
    });

    it('should return 404 if guest session expired', async () => {
      req.user = { id: 'guest123', isGuest: true };
      req.body = { type: 'expense', category: 'Food', amount: 50 };

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Guest session expired')
      }));
    });

    it('should handle errors', async () => {
      req.user = { _id: userId, isGuest: false };
      req.body = { type: 'expense', category: 'Food', amount: 50 };

      Transaction.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should enforce guest transaction limit', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.body = { type: 'expense', category: 'Food', amount: 50 };

      // Create 50 existing transactions (at the limit)
      const existingTransactions = Array.from({ length: 50 }, (_, i) => ({
        _id: `trans${i}`,
        type: 'expense',
        amount: 100
      }));

      guestStore.set(guestId, {
        transactions: existingTransactions,
        goals: []
      });

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        guestLimit: true,
        limit: 50
      }));
    });
  });

  describe('getTransactions', () => {
    it('should get transactions for authenticated user', async () => {
      req.user = { _id: userId, isGuest: false };

      const mockTransactions = [
        { type: 'expense', amount: 50, date: new Date() },
        { type: 'income', amount: 100, date: new Date() }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockTransactions))
      };

      Transaction.find = jest.fn().mockReturnValue(mockQuery);

      await getTransactions(req, res);

      expect(Transaction.find).toHaveBeenCalledWith({ user: userId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ date: -1, createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should get transactions for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };

      const guestTransactions = [
        { type: 'expense', amount: 25, date: new Date('2024-01-15') },
        { type: 'income', amount: 100, date: new Date('2024-01-20') }
      ];

      guestStore.set(guestId, { transactions: guestTransactions, goals: [] });

      await getTransactions(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveLength(2);
      // Should be sorted by date (newest first)
      expect(new Date(response[0].date) >= new Date(response[1].date)).toBe(true);
    });

    it('should return empty array if guest session expired', async () => {
      req.user = { id: 'guest123', isGuest: true };

      await getTransactions(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      req.user = { _id: userId, isGuest: false };

      Transaction.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve, reject) => reject(new Error('Database error')))
      });

      await getTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction for authenticated user', async () => {
      req.user = { _id: userId, isGuest: false };
      req.params = { id: 'trans123' };
      req.body = {
        type: 'expense',
        category: 'Food',
        amount: 75,
        note: 'Updated note',
        date: new Date()
      };

      const mockUpdatedTransaction = {
        _id: 'trans123',
        user: userId,
        type: 'expense',
        category: 'Food',
        amount: 75,
        note: 'Updated note'
      };

      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(mockUpdatedTransaction);

      await updateTransaction(req, res);

      expect(Transaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'trans123', user: userId },
        expect.objectContaining({
          type: 'expense',
          category: 'Food',
          amount: 75
        }),
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedTransaction);
    });

    it('should update transaction for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.params = { id: 'trans1' };
      req.body = {
        type: 'income',
        category: 'Salary',
        amount: 5000,
        note: 'Monthly salary',
        date: new Date()
      };

      guestStore.set(guestId, {
        transactions: [
          { _id: 'trans1', type: 'expense', amount: 100, category: 'Food' }
        ],
        goals: []
      });

      await updateTransaction(req, res);

      const guestData = guestStore.get(guestId);
      expect(guestData.transactions[0].type).toBe('income');
      expect(guestData.transactions[0].amount).toBe(5000);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        type: 'income',
        amount: 5000
      }));
    });

    it('should return 404 if transaction not found', async () => {
      req.user = { _id: userId, isGuest: false };
      req.params = { id: 'nonexistent' };
      req.body = { type: 'expense', amount: 50 };

      Transaction.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.user = { _id: userId, isGuest: false };
      req.params = { id: 'trans123' };
      req.body = { type: 'expense', amount: 50 };

      Transaction.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('DB error'));

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction for authenticated user', async () => {
      req.user = { _id: 'user123', isGuest: false };
      req.params = { id: 'trans123' };

      const mockTransaction = {
        _id: 'trans123',
        user: 'user123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      Transaction.findById = jest.fn().mockResolvedValue(mockTransaction);

      await deleteTransaction(req, res);

      expect(Transaction.findById).toHaveBeenCalledWith('trans123');
      expect(mockTransaction.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });

    it('should return 404 if transaction not found', async () => {
      req.user = { _id: 'user123', isGuest: false };
      req.params = { id: 'trans123' };

      Transaction.findById = jest.fn().mockResolvedValue(null);

      await deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not found')
      }));
    });

    it('should handle errors', async () => {
      req.user = { _id: 'user123', isGuest: false };
      req.params = { id: 'trans123' };

      Transaction.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});
