import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import Goal from '../../models/Goal.js';
import { addContribution } from '../../controllers/goalController.js';
import { guestStore } from '../../controllers/userController.js';

describe('Goal Contribution Tests', () => {
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

  it('should add contribution to authenticated user goal', async () => {
    req.user = { id: 'user123', isGuest: false };
    req.params = { id: 'goal123' };
    req.body = { amount: 500 };

    const mockGoal = {
      _id: 'goal123',
      user: 'user123',
      name: 'Vacation',
      targetAmount: 5000,
      currentAmount: 1000,
      save: jest.fn().mockResolvedValue({
        _id: 'goal123',
        currentAmount: 1500,
        status: 'active'
      })
    };

    Goal.findById = jest.fn().mockResolvedValue(mockGoal);

    await addContribution(req, res);

    expect(Goal.findById).toHaveBeenCalledWith('goal123');
    expect(mockGoal.currentAmount).toBe(1500);
    expect(mockGoal.save).toHaveBeenCalled();
  });

  it('should add contribution to guest user goal', async () => {
    const guestId = 'guest123';
    req.user = { id: guestId, isGuest: true };
    req.params = { id: 'goal1' };
    req.body = { amount: 300 };

    guestStore.set(guestId, {
      goals: [
        { _id: 'goal1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2000, status: 'active' }
      ],
      transactions: []
    });

    await addContribution(req, res);

    const guestData = guestStore.get(guestId);
    expect(guestData.goals[0].currentAmount).toBe(2300);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      currentAmount: 2300,
      status: 'active'
    }));
  });

  it('should mark goal as completed when target is reached', async () => {
    const guestId = 'guest123';
    req.user = { id: guestId, isGuest: true };
    req.params = { id: 'goal1' };
    req.body = { amount: 3000 };

    guestStore.set(guestId, {
      goals: [
        { _id: 'goal1', name: 'Small Goal', targetAmount: 5000, currentAmount: 4000, status: 'active' }
      ],
      transactions: []
    });

    await addContribution(req, res);

    const guestData = guestStore.get(guestId);
    // The controller caps currentAmount at targetAmount
    expect(guestData.goals[0].currentAmount).toBe(5000);
    expect(guestData.goals[0].status).toBe('completed');
  });

  it('should return 400 for invalid contribution amount', async () => {
    req.user = { id: 'user123', isGuest: false };
    req.params = { id: 'goal123' };
    req.body = { amount: -100 };

    await addContribution(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Invalid')
    }));
  });

  it('should return 400 for zero contribution amount', async () => {
    req.user = { id: 'user123', isGuest: false };
    req.params = { id: 'goal123' };
    req.body = { amount: 0 };

    await addContribution(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 404 if goal not found', async () => {
    req.user = { id: 'user123', isGuest: false };
    req.params = { id: 'nonexistent' };
    req.body = { amount: 100 };

    Goal.findById = jest.fn().mockResolvedValue(null);

    await addContribution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle database errors gracefully', async () => {
    req.user = { id: 'user123', isGuest: false };
    req.params = { id: 'goal123' };
    req.body = { amount: 500 };

    Goal.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await addContribution(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
