/**
 * Guest Session Cleanup Utility
 * Automatically removes expired guest sessions from memory
 */

/**
 * Start automatic cleanup of expired guest sessions
 * @param {Map} guestStore - The guest data store
 * @param {number} intervalMinutes - How often to run cleanup (default: 60 minutes)
 */
export function startGuestCleanup(guestStore, intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`🧹 Starting guest session cleanup (every ${intervalMinutes} minutes)`);

  // Run cleanup immediately on startup
  cleanupExpiredSessions(guestStore);

  // Then run periodically
  const cleanupInterval = setInterval(() => {
    cleanupExpiredSessions(guestStore);
  }, intervalMs);

  // Return the interval ID so it can be cleared if needed
  return cleanupInterval;
}

/**
 * Clean up expired guest sessions
 * @param {Map} guestStore - The guest data store
 */
function cleanupExpiredSessions(guestStore) {
  const now = Date.now();
  let cleaned = 0;
  let active = 0;

  for (const [sessionId, data] of guestStore.entries()) {
    if (data.expiresAt < now) {
      guestStore.delete(sessionId);
      cleaned++;
    } else {
      active++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired guest session(s). Active sessions: ${active}`);
  } else if (active > 0) {
    console.log(`✅ Guest cleanup complete. Active sessions: ${active}`);
  }
}

/**
 * Manually trigger cleanup (useful for testing)
 * @param {Map} guestStore - The guest data store
 * @returns {Object} - Cleanup stats
 */
export function manualCleanup(guestStore) {
  const now = Date.now();
  let cleaned = 0;
  let active = 0;

  for (const [sessionId, data] of guestStore.entries()) {
    if (data.expiresAt < now) {
      guestStore.delete(sessionId);
      cleaned++;
    } else {
      active++;
    }
  }

  return { cleaned, active };
}
