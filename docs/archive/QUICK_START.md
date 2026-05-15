# 🚀 Quick Start Guide - Using Your New Components

## Deployment Smoke Check (One Command)

Run this from the project root to validate frontend routing, backend health, CORS, and protected API behavior:

```bash
npm run smoke:prod
```

To run against custom URLs:

```bash
npm run smoke:deploy -- --frontend-url=https://your-app.vercel.app --backend-url=https://your-api.onrender.com
```

## Immediate Next Steps

### 1. View the Component Showcase

Start your development server and navigate to the component showcase:

```bash
cd frontend
npm run dev
```

Then login and visit: **`http://localhost:5173/components`**

This page shows all components in action with live examples.

### 2. Start Using Components in Your Pages

Here's how to enhance your existing pages:

#### Example: Enhancing a Form Page

**Before:**
```jsx
<form>
  <input type="text" placeholder="Email" />
  <button type="submit">Submit</button>
</form>
```

**After:**
```jsx
import { Input, Button, useToast } from '../components/ui';

function MyForm() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // ... submit logic
    toast.success('Form submitted successfully!');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        fullWidth
      />
      <Button type="submit" variant="primary" fullWidth>
        Submit
      </Button>
    </form>
  );
}
```

#### Example: Using Cards for Better Layout

**Before:**
```jsx
<div className="bg-white p-4 rounded">
  <h2>Statistics</h2>
  <p>$1,234</p>
</div>
```

**After:**
```jsx
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui';

<Card hover variant="elevated">
  <CardHeader>
    <CardTitle>Statistics</CardTitle>
  </CardHeader>
  <CardBody>
    <p className="text-3xl font-bold text-primary-600">$1,234</p>
  </CardBody>
</Card>
```

#### Example: Better Notifications

**Before:**
```jsx
alert('Transaction saved!');
```

**After:**
```jsx
import { useToast } from '../components/ui';

function MyComponent() {
  const toast = useToast();
  
  const handleSave = () => {
    // ... save logic
    toast.success('Transaction saved successfully!');
  };
}
```

### 3. Common Patterns

#### Loading States
```jsx
import { Button, Spinner } from '../components/ui';

function SaveButton() {
  const [loading, setLoading] = useState(false);
  
  return (
    <Button loading={loading} onClick={handleSave}>
      Save Changes
    </Button>
  );
}
```

#### Confirmation Dialogs
```jsx
import { Modal, Button } from '../components/ui';

function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      <Button variant="danger" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>
      
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete this item?
      </Modal>
    </>
  );
}
```

#### Status Badges
```jsx
import { Badge } from '../components/ui';

<Badge variant="success" dot>Active</Badge>
<Badge variant="danger" dot>Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

#### Progress Tracking
```jsx
import { Progress } from '../components/ui';

<Progress 
  value={goalProgress} 
  max={100} 
  variant="success" 
  showLabel 
  label="Savings Goal"
/>
```

### 4. Pages to Enhance First

**Priority 1** (High Impact):
1. **Dashboard** - Replace cards, add progress bars, use badges
2. **Transactions** - Better forms, loading states, toast notifications
3. **Settings** - Use Toggle switches, Tabs for sections

**Priority 2** (Important):
4. **Goals** - Progress bars, modals for confirmations
5. **Budgets** - Cards with hover effects, alerts for warnings
6. **Analytics** - Tabs for different views, tooltips on charts

**Priority 3** (Nice to Have):
7. **Help** - Accordion for FAQs
8. **Reports** - Better layout with cards

### 5. Pattern Examples by Feature

#### Dashboard Cards
```jsx
import { Card, CardHeader, CardTitle, CardBody, Badge } from '../components/ui';

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card variant="elevated" hover>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Total Balance</CardTitle>
        <Badge variant="success">+12%</Badge>
      </div>
    </CardHeader>
    <CardBody>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        $12,345.67
      </p>
    </CardBody>
  </Card>
  
  {/* More cards... */}
</div>
```

#### Transaction Form
```jsx
import { Input, Select, Button, Textarea, useToast } from '../components/ui';

function TransactionForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call
      await saveTransaction(formData);
      toast.success('Transaction saved!');
    } catch (error) {
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount"
        type="number"
        step="0.01"
        leftIcon={<span>$</span>}
        required
        fullWidth
      />
      
      <Select
        label="Category"
        options={categories}
        required
        fullWidth
      />
      
      <Textarea
        label="Notes"
        rows={3}
        maxLength={200}
        showCount
        fullWidth
      />
      
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Save Transaction
      </Button>
    </form>
  );
}
```

#### Settings Page with Tabs
```jsx
import { Tabs, Toggle, Button } from '../components/ui';

function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  
  return (
    <Tabs
      variant="underline"
      tabs={[
        {
          label: 'Profile',
          content: <ProfileSettings />,
        },
        {
          label: 'Preferences',
          content: (
            <div className="space-y-4">
              <Toggle
                label="Email Notifications"
                description="Receive email updates"
                checked={notifications}
                onClick={() => setNotifications(!notifications)}
              />
              {/* More settings... */}
            </div>
          ),
        },
        {
          label: 'Security',
          content: <SecuritySettings />,
        },
      ]}
    />
  );
}
```

### 6. Testing Checklist

Before deploying enhancements:

- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test on mobile (responsive)
- [ ] Test keyboard navigation
- [ ] Test all form validations
- [ ] Test loading states
- [ ] Test error states
- [ ] Test with screen reader (optional but recommended)

### 7. Common Import Statement

Keep this handy for quick access:

```jsx
import {
  // Forms
  Button,
  Input,
  Select,
  Checkbox,
  Textarea,
  Toggle,
  
  // Layout
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  Modal,
  
  // Feedback
  Alert,
  useToast,
  Spinner,
  Progress,
  Skeleton,
  
  // Display
  Badge,
  Avatar,
  
  // Navigation
  Tabs,
  Accordion,
  Dropdown,
  Tooltip,
} from '../components/ui';
```

### 8. Need Help?

- **Component Docs**: See `frontend/src/components/ui/README.md`
- **Live Examples**: Visit `/components` route
- **Progress Tracking**: See `ENHANCEMENT_PROGRESS.md`
- **Full Guide**: See `PREMIUM_ENHANCEMENT_GUIDE.md`

### 9. Pro Tips

1. **Use semantic colors**: `variant="success"` for positive actions, `variant="danger"` for destructive actions
2. **Loading states**: Always show loading feedback for async operations
3. **Consistent spacing**: Use Tailwind's spacing utilities (`space-y-4`, `gap-6`)
4. **Dark mode**: Test every component in both themes
5. **Toast over alerts**: Replace all `alert()` calls with `toast.success()` or `toast.error()`
6. **Modals for confirmations**: Replace `confirm()` dialogs with Modal components
7. **Accessibility**: Use proper labels, ARIA attributes are already included

### 10. Quick Wins (30 min each)

**Easy enhancements you can do right now:**

1. **Replace all buttons** in one page with the new Button component
2. **Add toast notifications** to success/error messages
3. **Wrap content in Cards** for better visual hierarchy
4. **Add loading states** to async buttons
5. **Use Badges** for status indicators
6. **Add Tooltips** to icon buttons

---

**Start with one page at a time. The Dashboard is a great place to begin!** 🚀

Each enhancement you make will improve the user experience while maintaining all existing functionality.
