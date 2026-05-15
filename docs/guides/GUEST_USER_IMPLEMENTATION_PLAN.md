# Guest User Implementation Plan

## Current State Analysis

### Issues Identified
1. ❌ Frontend allows guest login, but backend rejects all guest requests (401 errors)
2. ❌ All backend APIs require JWT authentication - no guest token system exists
3. ❌ No in-memory data storage for guest users
4. ❌ No feature restrictions between authenticated and guest users
5. ❌ Guest data persists across sessions (localStorage not cleared properly)
6. ❌ No visual indicators showing guest limitations

### Current Flow
```
User clicks "Continue as Guest" 
→ Frontend sets isGuest=true in localStorage
→ User sees Dashboard UI
→ Dashboard tries to fetch transactions
→ Backend rejects (no JWT token) → 401 Error
→ Guest sees empty/broken UI
```

---

## Implementation Stages

## 📋 STAGE 1: Backend - Guest Token System
**Goal:** Create a special token system for guest users

### Tasks:
- [ ] **1.1** Create guest session ID generator
  - Generate unique session IDs (UUID)
  - Set expiration time (e.g., 24 hours)
  
- [ ] **1.2** Create in-memory guest data store
  - Store guest transactions, goals, and settings
  - Implement Map-based storage with session ID as key
  - Add automatic cleanup for expired sessions
  
- [ ] **1.3** Create guest token generation endpoint
  - New endpoint: `POST /api/users/guest-login`
  - Returns guest JWT with `role: 'guest'` and `sessionId`
  - Token expires in 24 hours

### Files to Modify:
- `backend/controllers/userController.js` - Add guest login function
- `backend/routes/userRoutes.js` - Add guest login route

### Code Example:
```javascript
// In-memory guest store
export const guestStore = new Map();

// Generate guest token
export const guestLogin = async (req, res) => {
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  // Initialize guest data
  guestStore.set(sessionId, {
    transactions: [],
    goals: [],
    settings: { currency: 'USD' },
    expiresAt
  });
  
  const token = jwt.sign(
    { id: sessionId, role: 'guest', sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ token, role: 'guest', name: 'Guest User' });
};
```

---

## 📋 STAGE 2: Backend - Middleware Updates
**Goal:** Allow guest tokens to pass through authentication

### Tasks:
- [ ] **2.1** Update `authMiddleware.js`
  - Detect if token has `role: 'guest'`
  - Set `req.user.isGuest = true` for guest tokens
  - Allow guest tokens to proceed
  
- [ ] **2.2** Create feature restriction middleware
  - New file: `middleware/guestRestrictions.js`
  - Block guests from certain endpoints (profile updates, admin, etc.)

### Files to Modify:
- `backend/middleware/authMiddleware.js`
- `backend/middleware/requireAuth.js`
- Create: `backend/middleware/guestRestrictions.js`

### Code Example:
```javascript
// authMiddleware.js
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'guest') {
        req.user = {
          _id: decoded.sessionId,
          id: decoded.sessionId,
          role: 'guest',
          isGuest: true
        };
        return next();
      }
      
      req.user = await User.findById(decoded.id).select("-password");
      req.user.isGuest = false;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  
  return res.status(401).json({ message: "No token provided" });
};
```

---

## 📋 STAGE 3: Backend - Controller Updates
**Goal:** Handle guest data separately from database

### Tasks:
- [ ] **3.1** Update Transaction Controller
  - Check if `req.user.isGuest`
  - If guest: use in-memory store
  - If authenticated: use MongoDB
  - Apply guest limits (e.g., max 50 transactions)
  
- [ ] **3.2** Update Goal Controller
  - Same dual-storage approach
  - Limit guests to 5 goals max
  
- [ ] **3.3** Update AI/Chatbot Controller
  - Allow basic queries for guests
  - Disable conversation history for guests

### Files to Modify:
- `backend/controllers/transactionController.js`
- `backend/controllers/goalController.js`
- `backend/controllers/aiController.js`

### Code Example:
```javascript
// transactionController.js
export const getTransactions = async (req, res) => {
  try {
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      if (!guestData) {
        return res.json([]);
      }
      return res.json(guestData.transactions || []);
    }
    
    // Authenticated user - use database
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  try {
    if (req.user.isGuest) {
      const guestData = guestStore.get(req.user.id);
      if (!guestData) {
        return res.status(404).json({ message: "Session expired" });
      }
      
      // Limit guest transactions
      if (guestData.transactions.length >= 50) {
        return res.status(403).json({ 
          message: "Guest limit reached. Please register to add more." 
        });
      }
      
      const transaction = {
        _id: crypto.randomUUID(),
        ...req.body,
        user: req.user.id,
        createdAt: new Date()
      };
      
      guestData.transactions.push(transaction);
      return res.status(201).json(transaction);
    }
    
    // Authenticated user - use database
    const transaction = await Transaction.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 📋 STAGE 4: Backend - Session Cleanup
**Goal:** Prevent memory leaks from abandoned guest sessions

### Tasks:
- [ ] **4.1** Create cleanup utility
  - Check guest sessions every hour
  - Remove expired sessions
  - Log cleanup activity
  
- [ ] **4.2** Integrate with server startup
  - Start cleanup interval when server starts

### Files to Modify:
- Create: `backend/utils/guestCleanup.js`
- `backend/server.js`

### Code Example:
```javascript
// guestCleanup.js
export function startGuestCleanup(guestStore) {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, data] of guestStore.entries()) {
      if (data.expiresAt < now) {
        guestStore.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired guest sessions`);
    }
  }, 60 * 60 * 1000); // Every hour
}
```

---

## 📋 STAGE 5: Frontend - Guest Token Request
**Goal:** Get guest token from backend when guest logs in

### Tasks:
- [ ] **5.1** Update Login.jsx guest handler
  - Call new guest login endpoint
  - Store guest token in localStorage
  - Set auth state properly
  
- [ ] **5.2** Test guest login flow

### Files to Modify:
- `frontend/src/pages/Login.jsx`

### Code Example:
```javascript
const handleGuestLogin = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/users/guest-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await res.json();
    
    localStorage.setItem("token", data.token);
    localStorage.setItem("guest", "true");
    localStorage.removeItem("user");
    
    setAuth({
      isAuthenticated: false,
      isGuest: true,
      token: data.token,
      user: null
    });
    
    window.location.replace("/dashboard");
  } catch (error) {
    console.error("Guest login failed:", error);
  }
};
```

---

## 📋 STAGE 6: Frontend - Guest Limitations UI
**Goal:** Show clear indicators when using guest mode

### Tasks:
- [ ] **6.1** Add guest banner to Dashboard
  - Show "Guest Mode - Data is temporary"
  - Add "Register to save" button
  
- [ ] **6.2** Add limitation notices
  - Show transaction limits (e.g., "5/50 transactions")
  - Show goal limits (e.g., "2/5 goals")
  
- [ ] **6.3** Disable restricted features
  - Hide/disable Settings page for guests
  - Hide profile picture upload
  - Show upgrade prompts

### Files to Modify:
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/pages/Settings.jsx`

### Code Example:
```jsx
// Dashboard.jsx - Add guest banner
{auth.isGuest && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-amber-600" size={20} />
        <div>
          <p className="font-semibold text-amber-900">Guest Mode</p>
          <p className="text-sm text-amber-700">
            Your data is temporary. Register to save permanently.
          </p>
        </div>
      </div>
      <Link 
        to="/register" 
        className="btn btn-primary"
      >
        Create Account
      </Link>
    </div>
  </div>
)}
```

---

## 📋 STAGE 7: Frontend - Logout Cleanup
**Goal:** Properly clear guest data on logout

### Tasks:
- [ ] **7.1** Update logout handler in Topbar
  - Clear localStorage completely
  - Clear any cached data
  - Redirect to login
  
- [ ] **7.2** Add session expiry handling
  - Detect 401 errors with expired guest tokens
  - Auto-logout and show message

### Files to Modify:
- `frontend/src/components/layout/Topbar.jsx`
- `frontend/src/services/api.js` (add interceptor)

---

## 📋 STAGE 8: Testing & Validation
**Goal:** Ensure everything works correctly

### Tasks:
- [ ] **8.1** Test guest login flow
  - Click "Continue as Guest"
  - Verify token is received
  - Verify dashboard loads with data
  
- [ ] **8.2** Test guest features
  - Add transactions
  - Add goals
  - Test chatbot
  - Verify limits are enforced
  
- [ ] **8.3** Test guest logout
  - Verify data is cleared
  - Can't access after logout
  
- [ ] **8.4** Test switching from guest to registered
  - Register as guest
  - Verify new account is created
  - Guest data is not carried over (expected behavior)
  
- [ ] **8.5** Test authenticated user flow
  - Ensure normal users unaffected
  - Verify database still works
  - Check admin access still works

---

## Feature Limitations for Guests

| Feature | Guest Access | Authenticated Access |
|---------|-------------|---------------------|
| View Dashboard | ✅ Yes | ✅ Yes |
| Add Transactions | ✅ Limited (50 max) | ✅ Unlimited |
| View Analytics | ✅ Yes | ✅ Yes |
| Create Goals | ✅ Limited (5 max) | ✅ Unlimited |
| AI Chatbot | ✅ Basic queries only | ✅ Full access + history |
| Profile Settings | ❌ No | ✅ Yes |
| Export Reports | ❌ No | ✅ Yes |
| Admin Panel | ❌ No | ✅ Admin only |
| Data Persistence | ⏰ 24 hours | ✅ Permanent |

---

## Success Criteria

✅ Guest users can log in without registration  
✅ Guest users can add up to 50 transactions  
✅ Guest users can create up to 5 goals  
✅ Guest data is stored in-memory (not in database)  
✅ Guest sessions expire after 24 hours  
✅ Expired guest sessions are cleaned automatically  
✅ Guest users see clear UI indicators about limitations  
✅ Guest users can register to convert to full account  
✅ Authenticated users are unaffected by changes  
✅ No data leakage between guest sessions  

---

## Estimated Timeline

- **Stage 1:** 2-3 hours
- **Stage 2:** 1-2 hours
- **Stage 3:** 3-4 hours
- **Stage 4:** 1 hour
- **Stage 5:** 1 hour
- **Stage 6:** 2-3 hours
- **Stage 7:** 1 hour
- **Stage 8:** 2-3 hours

**Total:** ~15-20 hours

---

## Notes

- Guest data is intentionally not persisted to database
- Consider adding guest-to-user conversion feature (optional)
- Monitor memory usage if guest traffic is high
- Consider Redis for production guest storage
- Add rate limiting for guest endpoints to prevent abuse
