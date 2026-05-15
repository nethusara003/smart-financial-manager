# CI/CD Quick Reference

## 🚀 Quick Start Commands

### Testing
```bash
# Frontend
cd frontend
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage

# Backend  
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage

# Both (from root)
npm test                  # Run all tests
npm run test:coverage     # Coverage for both
```

### Development
```bash
# Start servers
npm run dev:frontend      # Frontend dev server
npm run dev:backend       # Backend dev server

# Build
npm run build:frontend    # Build frontend for production
```

### Docker
```bash
npm run docker:build      # Build all images
npm run docker:up         # Start all containers
npm run docker:down       # Stop all containers
```

---

## 📁 Key Files

### Configuration
- `frontend/vitest.config.js` - Frontend test config
- `backend/jest.config.js` - Backend test config
- `.github/workflows/ci.yml` - Main CI pipeline
- `docker-compose.yml` - Docker orchestration

### Test Files
- `frontend/src/test/setup.js` - Frontend test setup
- `frontend/src/test/utils.jsx` - Test helpers
- `backend/test/setup.js` - Backend test setup
- `backend/test/utils.js` - Test utilities

### Environment
- `frontend/.env.example` - Frontend env template
- `backend/.env.example` - Backend env template

---

## ✅ Test Coverage Thresholds

```javascript
{
  branches: 70%,
  functions: 70%,
  lines: 80%,
  statements: 80%
}
```

---

## 🔄 GitHub Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to main/develop | Run tests, build, security scan |
| `pr-checks.yml` | PR opened/updated | Validate PR title, check conflicts |
| `coverage-report.yml` | PR to main/develop | Generate coverage reports |
| `deploy.yml` | Push to main | Deploy to production |
| `deploy-staging.yml` | Push to develop | Deploy to staging |
| `performance.yml` | PR to main / Weekly | Performance audits |

---

## 🔐 Required GitHub Secrets

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RENDER_SERVICE_ID
RENDER_API_KEY
JWT_SECRET
MONGODB_URI
STAGING_API_URL
BACKEND_URL
CODECOV_TOKEN (optional)
```

---

## 🧪 Writing Tests

### Frontend (Vitest)
```javascript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test/utils';

describe('Component', () => {
  it('renders correctly', () => {
    renderWithProviders(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Backend (Jest)
```javascript
import { describe, it, expect } from '@jest/globals';
import { createTestUser, generateTestToken } from '../../test/utils.js';

describe('Feature', () => {
  it('works correctly', async () => {
    const user = await createTestUser();
    expect(user).toBeDefined();
  });
});
```

---

## 🐛 Common Issues

**Tests fail with module errors:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Pre-commit hook not working:**
```bash
npx husky init
```

**Docker build fails:**
```bash
docker system prune -a
npm run docker:build
```

---

## 📊 Coverage Reports

After running tests with coverage:
```bash
# View in terminal (automatic)

# Open HTML report
# Frontend: frontend/coverage/index.html
# Backend: backend/coverage/index.html
```

---

## 🎯 Next Steps

1. ✅ Tests installed and working
2. ⏭️ Write more tests for your components
3. ⏭️ Push to GitHub to trigger CI
4. ⏭️ Configure deployment secrets
5. ⏭️ Deploy to staging/production

---

**Quick Help:**
- Full Guide: `CI_CD_IMPLEMENTATION_GUIDE.md`
- Summary: `CI_CD_IMPLEMENTATION_SUMMARY.md`
- This Card: `CI_CD_QUICK_REFERENCE.md`
