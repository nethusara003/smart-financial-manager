# Premium UI Component Library Documentation

This directory contains a comprehensive set of premium, production-ready UI components for the Smart Financial Manager application.

## Available Components

### Form Components
- **Button** - Multi-variant button with loading states, icons, and customizable sizes
- **Input** - Enhanced text input with labels, errors, icons, and helper text
- **Select** - Styled dropdown with consistent theming
- **Checkbox** - Custom checkbox with descriptions
- **Textarea** - Multi-line text input with character counter
- **Toggle** - Switch component for boolean settings

### Layout Components
- **Card** - Flexible card component with header, body, and footer sections
- **Modal** - Accessible modal dialog with backdrop and animations
- **Alert** - Notification banners for different message types

### Feedback Components
- **Toast** - Global toast notification system (via ToastProvider)
- **Spinner** - Loading indicators in various sizes and colors
- **LoadingOverlay** - Full-page loading screen
- **Progress** - Linear and circular progress bars
- **Skeleton** - Loading placeholders for better UX

### Display Components
- **Badge** - Status indicators and tags
- **Avatar** - User profile pictures with status indicators
- **AvatarGroup** - Display multiple avatars with overflow

## Usage

### Import Components

```jsx
import { Button, Input, Card, useToast } from '../components/ui';
```

### Using Toast Notifications

```jsx
import { useToast } from '../components/ui';

function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('An error occurred', 'Error', { duration: 7000 });
  };
  
  return (
    <Button onClick={handleSuccess}>Show Success Toast</Button>
  );
}
```

### Using Modal

```jsx
import { useState } from 'react';
import { Modal, Button } from '../components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        }
      >
        Are you sure you want to proceed?
      </Modal>
    </>
  );
}
```

### Using Cards

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui';

function StatCard({ title, value, description }) {
  return (
    <Card hover variant="default">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardBody>
        <p className="text-3xl font-bold text-primary-600">{value}</p>
      </CardBody>
    </Card>
  );
}
```

### Using Forms

```jsx
import { Input, Select, Button, useToast } from '../components/ui';

function MyForm() {
  const toast = useToast();
  const [formData, setFormData] = useState({ email: '', country: '' });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    // Submit logic
    toast.success('Form submitted successfully!');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        fullWidth
        required
      />
      
      <Select
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
        fullWidth
      />
      
      <Button type="submit" variant="primary" fullWidth>
        Submit
      </Button>
    </form>
  );
}
```

## Design Principles

1. **Accessibility First** - All components support keyboard navigation and screen readers
2. **Dark Mode** - Every component works perfectly in both light and dark themes
3. **Responsive** - Mobile-first design that scales beautifully to desktop
4. **Performance** - Optimized re-renders and lazy loading where appropriate
5. **Consistency** - Unified design language across all components

## Theme Support

All components automatically support dark mode via Tailwind's dark mode classes. They respect the user's theme preference set via the ThemeContext.

## Component Props

Each component is fully typed with PropTypes and includes sensible defaults. Check individual component files for detailed prop documentation.

## Viewing Components

Visit `/components` route (when logged in) to see a live showcase of all components with interactive examples.

## Best Practices

1. Always use the `useToast` hook for showing notifications instead of alerts
2. Use `Modal` for confirmations instead of browser confirms
3. Prefer `Skeleton` loaders over generic spinners for better UX
4. Use semantic color variants (success, danger, warning)
5. Always provide labels for form inputs
6. Use proper loading states on buttons during async operations

## Future Enhancements

- [ ] Dropdown menu component
- [ ] Tabs component
- [ ] Accordion component
- [ ] Table component with sorting/filtering
- [ ] Date picker component
- [ ] Autocomplete input
- [ ] File upload with drag & drop
