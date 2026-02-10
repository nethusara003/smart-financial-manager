import crypto from 'crypto';
import { generateResetToken } from '../generateResetToken.js';

describe('generateResetToken', () => {
  it('should generate a reset token with required fields', () => {
    const { resetToken, hashedToken, expires } = generateResetToken();

    expect(resetToken).toBeDefined();
    expect(hashedToken).toBeDefined();
    expect(expires).toBeDefined();
  });

  it('should generate a 64-character hex string for resetToken', () => {
    const { resetToken } = generateResetToken();
    
    expect(resetToken).toMatch(/^[a-f0-9]{64}$/);
    expect(resetToken).toHaveLength(64);
  });

  it('should generate a 64-character hex string for hashedToken', () => {
    const { hashedToken } = generateResetToken();
    
    expect(hashedToken).toMatch(/^[a-f0-9]{64}$/);
    expect(hashedToken).toHaveLength(64);
  });

  it('should hash the reset token correctly', () => {
    const { resetToken, hashedToken } = generateResetToken();
    
    // Manually hash the reset token to verify
    const manualHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    expect(hashedToken).toBe(manualHash);
  });

  it('should set expires to 15 minutes from now', () => {
    const before = Date.now() + 15 * 60 * 1000;
    const { expires } = generateResetToken();
    const after = Date.now() + 15 * 60 * 1000;
    
    expect(expires).toBeGreaterThanOrEqual(before);
    expect(expires).toBeLessThanOrEqual(after);
  });

  it('should generate unique tokens on each call', () => {
    const token1 = generateResetToken();
    const token2 = generateResetToken();
    
    expect(token1.resetToken).not.toBe(token2.resetToken);
    expect(token1.hashedToken).not.toBe(token2.hashedToken);
  });

  it('should return expires as a timestamp number', () => {
    const { expires } = generateResetToken();
    
    expect(typeof expires).toBe('number');
    expect(expires).toBeGreaterThan(Date.now());
  });

  it('should generate cryptographically random tokens', () => {
    const tokens = new Set();
    
    // Generate 100 tokens to check for randomness
    for (let i = 0; i < 100; i++) {
      const { resetToken } = generateResetToken();
      tokens.add(resetToken);
    }
    
    // All tokens should be unique
    expect(tokens.size).toBe(100);
  });
});
