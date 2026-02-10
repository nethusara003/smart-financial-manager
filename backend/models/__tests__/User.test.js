import { describe, it, expect } from '@jest/globals';
import User from '../../models/User.js';

// mongoose connection already established in test/setup.js
// No additional setup needed

describe('User Model Tests', () => {
  it('should create a user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.password).toBe('hashedpassword123');
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should require email field', async () => {
    const userData = {
      name: 'John Doe',
      password: 'password123',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should require password field', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should convert email to lowercase', async () => {
    const userData = {
      name: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
      password: 'password123',
    };

    const user = await User.create(userData);
    expect(user.email).toBe('john@example.com');
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should set default role as user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await User.create(userData);
    expect(user.role).toBe('user');
  });

  it('should set default currency as LKR', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await User.create(userData);
    expect(user.currency).toBe('LKR');
  });

  it('should allow setting admin role', async () => {
    const userData = {
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    };

    const user = await User.create(userData);
    expect(user.role).toBe('admin');
  });

  it('should allow setting super_admin role', async () => {
    const userData = {
      email: 'superadmin@example.com',
      password: 'password123',
      role: 'super_admin',
    };

    const user = await User.create(userData);
    expect(user.role).toBe('super_admin');
  });

  it('should accept valid currency codes', async () => {
    const currencies = ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY'];

    for (const currency of currencies) {
      const user = await User.create({
        email: `${currency.toLowerCase()}@example.com`,
        password: 'password123',
        currency,
      });
      expect(user.currency).toBe(currency);
    }
  });

  it('should reject invalid currency code', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      currency: 'XYZ',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should set default notification settings', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user.notificationSettings).toBeDefined();
    expect(user.notificationSettings.emailNotifications).toBe(true);
    expect(user.notificationSettings.budgetAlerts).toBe(true);
    expect(user.notificationSettings.weeklyReports).toBe(true);
  });

  it('should set default privacy settings', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user.privacySettings).toBeDefined();
    expect(user.privacySettings.twoFactorAuth).toBe(false);
    expect(user.privacySettings.sessionTimeout).toBe('30');
    expect(user.privacySettings.loginNotifications).toBe(true);
  });

  it('should update user profile fields', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    user.name = 'Updated Name';
    user.phone = '1234567890';
    user.bio = 'This is my bio';
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.name).toBe('Updated Name');
    expect(updated.phone).toBe('1234567890');
    expect(updated.bio).toBe('This is my bio');
  });

  it('should store profile picture URL', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      profilePicture: 'https://example.com/pic.jpg',
    });

    expect(user.profilePicture).toBe('https://example.com/pic.jpg');
  });

  it('should store reset password token', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    user.resetPasswordToken = 'reset-token-123';
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.resetPasswordToken).toBe('reset-token-123');
    expect(updated.resetPasswordExpires).toBeInstanceOf(Date);
  });

  it('should update notification settings', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    user.notificationSettings = {
      ...user.notificationSettings,
      emailNotifications: false,
      pushNotifications: true
    };
    user.markModified('notificationSettings');
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.notificationSettings.emailNotifications).toBe(false);
    expect(updated.notificationSettings.pushNotifications).toBe(true);
  });

  it('should update privacy settings', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    user.privacySettings = {
      ...user.privacySettings,
      twoFactorAuth: true,
      sessionTimeout: '60'
    };
    user.markModified('privacySettings');
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.privacySettings.twoFactorAuth).toBe(true);
    expect(updated.privacySettings.sessionTimeout).toBe('60');
  });

  it('should delete user successfully', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    await User.deleteOne({ _id: user._id });

    const found = await User.findById(user._id);
    expect(found).toBeNull();
  });

  it('should set default empty strings for optional fields', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user.name).toBe('');
    expect(user.phone).toBe('');
    expect(user.bio).toBe('');
    expect(user.profilePicture).toBe('');
  });

  it('should track timestamps on creation', async () => {
    const before = new Date();

    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    const after = new Date();

    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(user.updatedAt).toBeDefined();
  });

  it('should update updatedAt timestamp on modification', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    });

    const originalUpdatedAt = user.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    user.name = 'Updated Name';
    await user.save();

    expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
