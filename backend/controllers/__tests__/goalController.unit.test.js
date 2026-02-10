import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import Goal from '../../models/Goal.js';
import { getGoals, createGoal, deleteGoal, updateGoal } from '../../controllers/goalController.js';
import { guestStore } from '../../controllers/userController.js';

describe('Goal Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
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

  describe('getGoals', () => {
    it('should get goals for authenticated user', async () => {
      req.user = { id: 'user123', isGuest: false };

      const mockGoals = [
        { name: 'Vacation Fund', targetAmount: 5000, createdAt: new Date() },
        { name: 'Emergency Fund', targetAmount: 10000, createdAt: new Date() }
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockGoals))
      };

      Goal.find = jest.fn().mockReturnValue(mockQuery);

      await getGoals(req, res);

      expect(Goal.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });

    it('should get goals for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };

      const guestGoals = [
        { name: 'Goal 1', targetAmount: 1000, createdAt: new Date('2024-01-15') },
        { name: 'Goal 2', targetAmount: 2000, createdAt: new Date('2024-01-20') }
      ];

      guestStore.set(guestId, { goals: guestGoals, transactions: [] });

      await getGoals(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveLength(2);
    });

    it('should return empty array if guest session expired', async () => {
      req.user = { id: 'guest123', isGuest: true };

      await getGoals(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      req.user = { id: 'user123', isGuest: false };

      Goal.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve, reject) => reject(new Error('Database error')))
      });

      await getGoals(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createGoal', () => {
    it('should create goal for authenticated user', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.body = {
        name: 'Vacation Fund',
        targetAmount: 5000,
        currentAmount: 1000,
        targetDate: '2025-12-31',
        category: 'travel'
      };

      const savedGoal = {
        _id: 'goal123',
        name: 'Vacation Fund',
        targetAmount: 5000,
        currentAmount: 1000,
        category: 'travel'
      };

      // Mock the Goal constructor's prototype method
      const saveMock = jest.fn().mockResolvedValue(savedGoal);
      const OriginalGoal = Goal;
      
      // Replace Goal constructor temporarily
      const GoalMock = function(data) {
        this.save = saveMock;
        Object.assign(this, data);
      };
      
      // Replace in the module - this is a bit tricky with ES modules
      // Instead, let's just spy on the instance that will be created
      Goal.prototype.save = saveMock;

      await createGoal(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      
      // Restore
      delete Goal.prototype.save;
    });

    it('should create goal for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.body = {
        name: 'Emergency Fund',
        targetAmount: 10000
      };

      guestStore.set(guestId, { goals: [], transactions: [] });

      await createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Emergency Fund',
        targetAmount: 10000
      }));

      const guestData = guestStore.get(guestId);
      expect(guestData.goals).toHaveLength(1);
    });

    it('should return 404 if guest session expired', async () => {
      req.user = { id: 'guest123', isGuest: true };
      req.body = { name: 'Goal', targetAmount: 1000 };

      await createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Guest session expired')
      }));
    });

    it('should enforce guest goal limit', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.body = { name: 'Goal 6', targetAmount: 1000 };

      // Create 5 goals (the limit)
      const existingGoals = Array(5).fill(null).map((_, i) => ({
        _id: `goal${i}`,
        name: `Goal ${i}`,
        targetAmount: 1000
      }));

      guestStore.set(guestId, { goals: existingGoals, transactions: [] });

      await createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        guestLimit: true,
        limit: 5
      }));
    });

    it('should handle errors', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.body = { name: 'Goal', targetAmount: 1000 };

      const saveMock = jest.fn().mockRejectedValue(new Error('Database error'));
      Goal.prototype.save = saveMock;

      await createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      
      // Restore
      delete Goal.prototype.save;
    });
  });

  describe('updateGoal', () => {
    it('should update goal for authenticated user', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'goal123' };
      req.body = {
        name: 'Updated Goal',
        targetAmount: 7000
      };

      const mockGoal = {
        _id: 'goal123',
        user: 'user123',
        name: 'Old Goal'
      };

      const mockUpdatedGoal = {
        _id: 'goal123',
        user: 'user123',
        name: 'Updated Goal',
        targetAmount: 7000
      };

      Goal.findById = jest.fn().mockResolvedValue(mockGoal);
      Goal.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedGoal);

      await updateGoal(req, res);

      expect(Goal.findById).toHaveBeenCalledWith('goal123');
      expect(Goal.findByIdAndUpdate).toHaveBeenCalledWith(
        'goal123',
        expect.objectContaining({
          name: 'Updated Goal',
          targetAmount: 7000
        }),
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedGoal);
    });

    it('should update goal for guest user', async () => {
      const guestId = 'guest123';
      req.user = { id: guestId, isGuest: true };
      req.params = { id: 'goal1' };
      req.body = {
        name: 'Updated Emergency Fund',
        targetAmount: 12000
      };

      guestStore.set(guestId, {
        goals: [
          { _id: 'goal1', name: 'Emergency Fund', targetAmount: 10000 }
        ],
        transactions: []
      });

      await updateGoal(req, res);

      const guestData = guestStore.get(guestId);
      expect(guestData.goals[0].name).toBe('Updated Emergency Fund');
      expect(guestData.goals[0].targetAmount).toBe(12000);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Emergency Fund',
        targetAmount: 12000
      }));
    });

    it('should return 404 if goal not found', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'nonexistent' };
      req.body = { name: 'Updated Goal' };

      Goal.findById = jest.fn().mockResolvedValue(null);

      await updateGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'goal123' };
      req.body = { name: 'Test' };

      Goal.findById = jest.fn().mockRejectedValue(new Error('DB error'));

      await updateGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal for authenticated user', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'goal123' };

      const mockGoal = {
        _id: 'goal123',
        user: 'user123'
      };

      Goal.findById = jest.fn().mockResolvedValue(mockGoal);
      Goal.findByIdAndDelete = jest.fn().mockResolvedValue(mockGoal);

      await deleteGoal(req, res);

      expect(Goal.findByIdAndDelete).toHaveBeenCalledWith('goal123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });

    it('should return 404 if goal not found', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'goal123' };

      Goal.findById = jest.fn().mockResolvedValue(null);

      await deleteGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req.user = { id: 'user123', isGuest: false };
      req.params = { id: 'goal123' };

      Goal.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await deleteGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
