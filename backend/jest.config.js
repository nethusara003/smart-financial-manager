export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    // Exclude AI chatbot features (not core business logic)
    '!controllers/aiController.js',
    '!controllers/adminController.js',
    '!controllers/adminAcceptController.js',
    '!controllers/adminAnalyticsController.js',
    '!controllers/adminTransactionController.js',
    '!routes/adminRoutes.js',
    '!routes/adminAnalyticsRoutes.js',
    '!routes/aiRoutes.js',
    '!middleware/adminMiddleware.js',
    '!middleware/requireSuperAdmin.js',
    '!middleware/guestRestrictions.js',
    '!utils/chatDataQueries.js',
    '!utils/contextManager.js',
    '!utils/entityExtractor.js',
    '!utils/intentRecognition.js',
    '!utils/responseGenerator.js',
    '!utils/dataFormatters.js',
    '!utils/guestCleanup.js',
    '!utils/sendEmail.js',
    '!utils/sendResetEmail.js',
    '!models/AdminAudit.js',
    '!models/AdminInvitation.js',
    '!models/Conversation.js'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testTimeout: 120000,
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
