// API utility functions

/**
 * Build a query string from an object of parameters
 * @param {Object} params - Parameters to convert to query string
 * @returns {string} URL query string
 */
export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Get authorization headers for API requests
 * @param {string} token - JWT token
 * @returns {Object} Headers object
 */
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Handle and format API errors
 * @param {Error} error - Error object from API request
 * @returns {Object} Formatted error with message and status
 */
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1
    };
  }
}
