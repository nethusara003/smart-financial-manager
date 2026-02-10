import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTime, isToday, isThisMonth, getMonthRange } from '../dateHelpers.js';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T10:30:00');

    it('should format date in short format', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toContain('Mar');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid Date');
      expect(formatDate(null)).toBe('Invalid Date');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-01-01');
      expect(result).toContain('2024');
      expect(result).toBeTruthy();
    });

    it('should default to short format', () => {
      const result = formatDate(testDate);
      expect(result).toContain('Mar');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Just now" for recent times', () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe('Just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should handle singular forms', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      expect(getRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isThisMonth', () => {
    it('should return true for current month', () => {
      const now = new Date();
      expect(isThisMonth(now)).toBe(true);
    });

    it('should return false for last month', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      expect(isThisMonth(lastMonth)).toBe(false);
    });

    it('should return false for next month', () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      expect(isThisMonth(nextMonth)).toBe(false);
    });
  });

  describe('getMonthRange', () => {
    it('should return first and last day of month', () => {
      const date = new Date('2024-03-15');
      const { start, end } = getMonthRange(date);
      
      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(2); // March is month 2 (0-indexed)
      expect(end.getDate()).toBe(31); // March has 31 days
    });

    it('should handle February in leap year', () => {
      const date = new Date('2024-02-15'); // 2024 is leap year
      const { end } = getMonthRange(date);
      
      expect(end.getDate()).toBe(29);
    });

    it('should handle February in non-leap year', () => {
      const date = new Date('2023-02-15'); // 2023 is not leap year
      const { end } = getMonthRange(date);
      
      expect(end.getDate()).toBe(28);
    });

    it('should default to current month', () => {
      const { start, end } = getMonthRange();
      const now = new Date();
      
      expect(start.getMonth()).toBe(now.getMonth());
      expect(end.getMonth()).toBe(now.getMonth());
    });
  });
});
