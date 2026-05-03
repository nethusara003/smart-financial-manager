import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  Badge,
  Alert,
  Modal,
  Spinner,
  Select,
  Checkbox,
  Textarea,
  Toggle,
  Avatar,
  AvatarGroup,
  Progress,
  CircularProgress,
  Skeleton,
  CardSkeleton,
  useToast,
  Tooltip,
  Tabs,
  Accordion,
  Dropdown,
} from '../components/ui';

/**
 * Component Library Showcase Page
 * Demonstrates all premium UI components
 */
const ComponentShowcase = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Premium UI Component Library
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A showcase of all available components in the design system
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button variants and sizes</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<span>📧</span>}>With Left Icon</Button>
              <Button rightIcon={<span>→</span>}>With Right Icon</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Input fields, selects, checkboxes, and more</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              helperText="We'll never share your email"
              fullWidth
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              error="Password must be at least 8 characters"
              fullWidth
            />
            
            <Select
              label="Country"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'ca', label: 'Canada' },
              ]}
              placeholder="Select your country"
              fullWidth
            />
            
            <Textarea
              label="Description"
              placeholder="Enter description..."
              rows={4}
              maxLength={500}
              showCount
              fullWidth
            />
            
            <Checkbox
              label="Accept terms and conditions"
              description="By checking this, you agree to our terms"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            
            <Toggle
              label="Enable notifications"
              description="Receive email notifications"
              checked={isToggled}
              onClick={() => setIsToggled(!isToggled)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" hover>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>Standard card with hover effect</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              This is a default card with hover animation.
            </p>
          </CardBody>
        </Card>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Card with elevated shadow</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              This card has enhanced shadows for elevation.
            </p>
          </CardBody>
        </Card>
        
        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Gradient Card</CardTitle>
            <CardDescription>Card with gradient background</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="text-white/90">
              Beautiful gradient background card.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and tags</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>Online</Badge>
              <Badge variant="danger" dot>Offline</Badge>
              <Badge variant="warning" dot>Away</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" removable onRemove={() => {}}>
                Removable
              </Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Alerts */}
      <div className="space-y-4">
        <Alert variant="success" title="Success!" dismissible>
          Your changes have been saved successfully.
        </Alert>
        
        <Alert variant="danger" title="Error" dismissible>
          There was an error processing your request.
        </Alert>
        
        <Alert variant="warning" title="Warning">
          Your session will expire in 5 minutes.
        </Alert>
        
        <Alert variant="info" dismissible>
          This is an informational message without a title.
        </Alert>
      </div>

      {/* Toasts */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>Click buttons to show toast messages</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success('This is a success message!')}>
              Show Success
            </Button>
            <Button onClick={() => toast.error('This is an error message!')}>
              Show Error
            </Button>
            <Button onClick={() => toast.warning('This is a warning message!')}>
              Show Warning
            </Button>
            <Button onClick={() => toast.info('This is an info message!')}>
              Show Info
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>User profile pictures</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Avatar name="John Doe" size="xs" />
              <Avatar name="Jane Smith" size="sm" />
              <Avatar name="Bob Johnson" size="md" status="online" />
              <Avatar name="Alice Williams" size="lg" />
              <Avatar name="Charlie Brown" size="xl" status="away" />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Avatar Group
              </p>
              <AvatarGroup max={4} size="md">
                <Avatar name="User One" />
                <Avatar name="User Two" />
                <Avatar name="User Three" />
                <Avatar name="User Four" />
                <Avatar name="User Five" />
                <Avatar name="User Six" />
              </AvatarGroup>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>Linear and circular progress bars</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <Progress value={30} showLabel label="Upload Progress" />
            <Progress value={60} variant="success" showLabel />
            <Progress value={85} variant="warning" striped animated showLabel />
            
            <div className="flex gap-6">
              <CircularProgress value={25} variant="primary" size="md" />
              <CircularProgress value={50} variant="success" size="md" />
              <CircularProgress value={75} variant="warning" size="md" />
              <CircularProgress value={100} variant="danger" size="md" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Spinners</CardTitle>
          <CardDescription>Various loading indicators</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-6 items-center">
            <Spinner size="xs" />
            <Spinner size="sm" color="success" />
            <Spinner size="md" color="primary" />
            <Spinner size="lg" color="danger" />
            <Spinner size="xl" color="warning" />
          </div>
        </CardBody>
      </Card>

      {/* Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loaders</CardTitle>
          <CardDescription>Loading placeholders</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton variant="title" width="60%" />
              <Skeleton variant="text" count={3} />
              <Skeleton variant="button" width="30%" />
            </div>
            
            <CardSkeleton />
          </div>
        </CardBody>
      </Card>

      {/* Tooltips */}
      <Card>
        <CardHeader>
          <CardTitle>Tooltips</CardTitle>
          <CardDescription>Hover to see tooltips</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Tooltip content="This is a top tooltip" position="top">
              <Button>Top Tooltip</Button>
            </Tooltip>
            <Tooltip content="This is a bottom tooltip" position="bottom">
              <Button>Bottom Tooltip</Button>
            </Tooltip>
            <Tooltip content="This is a left tooltip" position="left">
              <Button>Left Tooltip</Button>
            </Tooltip>
            <Tooltip content="This is a right tooltip" position="right">
              <Button>Right Tooltip</Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Different tab variants</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <Tabs
              variant="underline"
              tabs={[
                { label: 'Profile', content: <div className="p-4">Profile content goes here</div> },
                { label: 'Settings', content: <div className="p-4">Settings content goes here</div>, badge: '3' },
                { label: 'Notifications', content: <div className="p-4">Notifications content goes here</div> },
              ]}
            />
            
            <Tabs
              variant="pills"
              tabs={[
                { label: 'Overview', content: <div className="p-4">Overview content</div> },
                { label: 'Analytics', content: <div className="p-4">Analytics content</div> },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      {/* Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Accordion</CardTitle>
          <CardDescription>Expandable content sections</CardDescription>
        </CardHeader>
        <CardBody>
          <Accordion
            items={[
              {
                title: 'What is Smart Financial Tracker?',
                content: 'A comprehensive financial management platform to track expenses, set goals, and manage budgets.',
              },
              {
                title: 'How do I get started?',
                content: 'Create an account, add your first transaction, and start tracking your finances.',
              },
              {
                title: 'Is my data secure?',
                content: 'Yes, we use industry-standard encryption and security measures to protect your data.',
              },
            ]}
            defaultOpen={[0]}
          />
        </CardBody>
      </Card>

      {/* Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Menu</CardTitle>
          <CardDescription>Context menus and action dropdowns</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Dropdown
              trigger={<Button>Actions ▼</Button>}
              items={[
                { label: 'Edit', icon: '✏️', onClick: () => toast.info('Edit clicked') },
                { label: 'Duplicate', icon: '📋', onClick: () => toast.info('Duplicate clicked') },
                { divider: true },
                { label: 'Archive', icon: '📦', onClick: () => toast.info('Archive clicked') },
                { label: 'Delete', icon: '🗑️', danger: true, onClick: () => toast.error('Delete clicked') },
              ]}
            />
            
            <Dropdown
              trigger={<Button variant="outline">More ⋯</Button>}
              position="bottom-right"
              items={[
                { label: 'Profile', icon: '👤', shortcut: '⌘P' },
                { label: 'Settings', icon: '⚙️', shortcut: '⌘,' },
                { label: 'Help', icon: '❓', badge: 'New' },
                { divider: true },
                { label: 'Logout', icon: '🚪', danger: true },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              toast.success('Modal action completed!');
              setIsModalOpen(false);
            }}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          This is a premium modal component with backdrop blur, animations,
          and keyboard support. Press ESC to close or click outside.
        </p>
      </Modal>
    </div>
  );
};

export default ComponentShowcase;
