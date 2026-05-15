# Premium UI/UX Design System Implementation Guide

**Project:** Smart Financial Tracker  
**Purpose:** Step-by-step guide to create a production-ready design system  
**Timeline:** 2-3 Weeks  
**Last Updated:** February 6, 2026

---

## Table of Contents

1. [Stage 1: Design Research & Planning](#stage-1-design-research--planning)
2. [Stage 2: Component Library Foundation](#stage-2-component-library-foundation)
3. [Stage 3: Advanced UI Features](#stage-3-advanced-ui-features)
4. [Stage 4: Responsive & Accessible Design](#stage-4-responsive--accessible-design)
5. [Appendix: Quick Reference](#appendix-quick-reference)

---

## STAGE 1: Design Research & Planning

**Duration:** 3-4 days  
**Objective:** Create a comprehensive design language and style guide

---

### STEP 1.1: Competitive Research (Day 1 - Morning)

**What to do:**
1. Open and analyze these financial apps:
   - [Revolut](https://www.revolut.com) - Modern banking UX
   - [Mint](https://mint.intuit.com) - Budget tracking interface
   - [YNAB](https://www.youneedabudget.com) - Goal-oriented design
   - [N26](https://n26.com) - Minimalist approach

2. **Screenshot and note:**
   - Color schemes they use
   - Button styles and sizes
   - Card designs and shadows
   - Typography hierarchy
   - Spacing patterns
   - Dashboard layouts
   - Form designs
   - Chart/graph styles

3. **Create a folder:**
   ```
   frontend/design-research/
   ├── inspiration/
   │   ├── screenshots/
   │   ├── color-palettes/
   │   └── notes.md
   └── decisions.md
   ```

**✓ Checkpoint:** You should have 10-15 screenshots and notes about what works well.

---

### STEP 1.2: Define Color Palette (Day 1 - Afternoon)

**What to do:**

1. **Choose your primary color** (brand identity)
   - Financial apps often use: Blue (trust), Green (growth), Purple (premium)
   - Use [Coolors.co](https://coolors.co) to generate palettes
   - Test color psychology for finance

2. **Create complete color system in Tailwind config:**

   **Open:** `frontend/tailwind.config.js`

   **Add this inside `theme.extend.colors`:**

   ```javascript
   colors: {
     // Primary brand color
     primary: {
       50: '#f0f9ff',
       100: '#e0f2fe',
       200: '#bae6fd',
       300: '#7dd3fc',
       400: '#38bdf8',
       500: '#0ea5e9',  // Main primary
       600: '#0284c7',
       700: '#0369a1',
       800: '#075985',
       900: '#0c4a6e',
       950: '#082f49',
     },
     // Secondary/accent color
     secondary: {
       50: '#fdf4ff',
       100: '#fae8ff',
       200: '#f5d0fe',
       300: '#f0abfc',
       400: '#e879f9',
       500: '#d946ef',  // Main secondary
       600: '#c026d3',
       700: '#a21caf',
       800: '#86198f',
       900: '#701a75',
     },
     // Success (green for income/positive)
     success: {
       50: '#f0fdf4',
       100: '#dcfce7',
       200: '#bbf7d0',
       300: '#86efac',
       400: '#4ade80',
       500: '#22c55e',  // Main success
       600: '#16a34a',
       700: '#15803d',
       800: '#166534',
       900: '#14532d',
     },
     // Danger (red for expenses/negative)
     danger: {
       50: '#fef2f2',
       100: '#fee2e2',
       200: '#fecaca',
       300: '#fca5a5',
       400: '#f87171',
       500: '#ef4444',  // Main danger
       600: '#dc2626',
       700: '#b91c1c',
       800: '#991b1b',
       900: '#7f1d1d',
     },
     // Warning (yellow/orange for alerts)
     warning: {
       50: '#fffbeb',
       100: '#fef3c7',
       200: '#fde68a',
       300: '#fcd34d',
       400: '#fbbf24',
       500: '#f59e0b',  // Main warning
       600: '#d97706',
       700: '#b45309',
       800: '#92400e',
       900: '#78350f',
     },
     // Neutral grays
     gray: {
       50: '#f9fafb',
       100: '#f3f4f6',
       200: '#e5e7eb',
       300: '#d1d5db',
       400: '#9ca3af',
       500: '#6b7280',
       600: '#4b5563',
       700: '#374151',
       800: '#1f2937',
       900: '#111827',
       950: '#030712',
     },
   }
   ```

3. **Test your colors:**
   - Check contrast ratios at [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Text on background must be at least 4.5:1 ratio
   - Buttons and important UI: 3:1 ratio minimum

**✓ Checkpoint:** Your Tailwind config now has a complete, accessible color system.

---

### STEP 1.3: Typography System (Day 2 - Morning)

**What to do:**

1. **Choose font families:**
   - **Heading font:** Inter, Manrope, Outfit, or Poppins (modern, professional)
   - **Body font:** Inter, System UI, or DM Sans (readable)
   - **Monospace:** Fira Code or JetBrains Mono (for numbers/codes)

2. **Add fonts to your project:**

   **Option A: Using Google Fonts (Easier)**

   **Open:** `frontend/index.html`

   **Add in `<head>`:**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
   ```

   **Option B: Self-hosted (Faster)**
   - Download fonts from [Google Fonts](https://fonts.google.com)
   - Place in `frontend/src/assets/fonts/`
   - Import in CSS

3. **Configure in Tailwind:**

   **Open:** `frontend/tailwind.config.js`

   **Add inside `theme.extend`:**

   ```javascript
   fontFamily: {
     sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
     mono: ['Fira Code', 'monospace'],
   },
   fontSize: {
     'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
     'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
     'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
     'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
     'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
     '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
     '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
     '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
     '5xl': ['3rem', { lineHeight: '1' }],           // 48px
     '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
   },
   fontWeight: {
     light: '300',
     normal: '400',
     medium: '500',
     semibold: '600',
     bold: '700',
     extrabold: '800',
   },
   ```

**✓ Checkpoint:** Test by adding `className="font-sans text-2xl font-semibold"` to any element.

---

### STEP 1.4: Spacing & Sizing System (Day 2 - Afternoon)

**What to do:**

1. **Configure spacing scale in Tailwind:**

   **Open:** `frontend/tailwind.config.js`

   **Add inside `theme.extend`:**

   ```javascript
   spacing: {
     '0': '0px',
     '1': '0.25rem',   // 4px
     '2': '0.5rem',    // 8px
     '3': '0.75rem',   // 12px
     '4': '1rem',      // 16px
     '5': '1.25rem',   // 20px
     '6': '1.5rem',    // 24px
     '8': '2rem',      // 32px
     '10': '2.5rem',   // 40px
     '12': '3rem',     // 48px
     '16': '4rem',     // 64px
     '20': '5rem',     // 80px
     '24': '6rem',     // 96px
     '32': '8rem',     // 128px
   },
   borderRadius: {
     'none': '0',
     'sm': '0.25rem',    // 4px
     'DEFAULT': '0.5rem', // 8px
     'md': '0.75rem',    // 12px
     'lg': '1rem',       // 16px
     'xl': '1.5rem',     // 24px
     '2xl': '2rem',      // 32px
     'full': '9999px',
   },
   ```

**✓ Checkpoint:** Consistent spacing values are now available.

---

### STEP 1.5: Shadow & Elevation System (Day 2 - Evening)

**What to do:**

1. **Add shadow system to Tailwind:**

   **Open:** `frontend/tailwind.config.js`

   **Add inside `theme.extend`:**

   ```javascript
   boxShadow: {
     'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
     'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
     'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
     'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
     'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
     'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
     'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
     'none': 'none',
     // Custom shadows for cards
     'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
     'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
   },
   ```

**✓ Checkpoint:** You can now use `shadow-card` and `shadow-card-hover` classes.

---

### STEP 1.6: Animation & Transition Settings (Day 3 - Morning)

**What to do:**

1. **Configure animations in Tailwind:**

   **Open:** `frontend/tailwind.config.js`

   **Add inside `theme.extend`:**

   ```javascript
   transitionDuration: {
     '75': '75ms',
     '100': '100ms',
     '150': '150ms',
     '200': '200ms',
     '300': '300ms',
     '500': '500ms',
     '700': '700ms',
   },
   transitionTimingFunction: {
     'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
     'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
   },
   keyframes: {
     'fade-in': {
       '0%': { opacity: '0' },
       '100%': { opacity: '1' },
     },
     'slide-in-up': {
       '0%': { transform: 'translateY(10px)', opacity: '0' },
       '100%': { transform: 'translateY(0)', opacity: '1' },
     },
     'slide-in-down': {
       '0%': { transform: 'translateY(-10px)', opacity: '0' },
       '100%': { transform: 'translateY(0)', opacity: '1' },
     },
     'scale-in': {
       '0%': { transform: 'scale(0.95)', opacity: '0' },
       '100%': { transform: 'scale(1)', opacity: '1' },
     },
   },
   animation: {
     'fade-in': 'fade-in 0.2s ease-out',
     'slide-in-up': 'slide-in-up 0.3s ease-out',
     'slide-in-down': 'slide-in-down 0.3s ease-out',
     'scale-in': 'scale-in 0.2s ease-out',
   },
   ```

**✓ Checkpoint:** Test with `className="animate-fade-in"` on any element.

---

### STEP 1.7: Create Design Tokens Document (Day 3 - Afternoon)

**What to do:**

1. **Create design documentation:**

   **Create file:** `frontend/design-research/design-tokens.md`

   **Add this content:**

   ```markdown
   # Design Tokens - Smart Financial Tracker

   ## Colors

   ### Primary (Blue - Trust & Reliability)
   - Main: #0ea5e9
   - Usage: CTA buttons, links, key highlights

   ### Success (Green - Income/Positive)
   - Main: #22c55e
   - Usage: Income transactions, success states, positive trends

   ### Danger (Red - Expense/Negative)
   - Main: #ef4444
   - Usage: Expense transactions, errors, budget overruns

   ### Warning (Orange - Alerts)
   - Main: #f59e0b
   - Usage: Warnings, approaching budget limits

   ## Typography

   ### Headings
   - H1: 3rem (48px), font-bold
   - H2: 2.25rem (36px), font-semibold
   - H3: 1.875rem (30px), font-semibold
   - H4: 1.5rem (24px), font-medium

   ### Body
   - Large: 1.125rem (18px)
   - Regular: 1rem (16px)
   - Small: 0.875rem (14px)
   - Tiny: 0.75rem (12px)

   ## Spacing

   - Component padding: 1rem (16px)
   - Card padding: 1.5rem (24px)
   - Section spacing: 2rem (32px)
   - Page margins: Responsive (4-8)

   ## Shadows

   - Card: shadow-card
   - Card hover: shadow-card-hover
   - Modal: shadow-xl
   - Dropdown: shadow-lg

   ## Border Radius

   - Buttons: rounded-lg (16px)
   - Cards: rounded-xl (24px)
   - Inputs: rounded-md (12px)
   - Badges: rounded-full

   ## Transitions

   - Default: 200ms ease-smooth
   - Hover effects: 150ms
   - Page transitions: 300ms
   ```

**✓ Checkpoint:** You have a reference document for all design decisions.

---

## STAGE 2: Component Library Foundation

**Duration:** 5-6 days  
**Objective:** Build reusable, styled atomic components

---

### STEP 2.1: Create Component Structure (Day 4 - Morning)

**What to do:**

1. **Create organized component folders:**

   ```bash
   frontend/src/components/
   ├── atoms/
   │   ├── Button.jsx
   │   ├── Input.jsx
   │   ├── Badge.jsx
   │   ├── Card.jsx
   │   ├── Spinner.jsx
   │   └── Tooltip.jsx
   ├── molecules/
   │   ├── FormGroup.jsx
   │   ├── SearchBar.jsx
   │   ├── Alert.jsx
   │   └── Modal.jsx
   ├── organisms/
   │   ├── TransactionTable.jsx
   │   ├── BudgetCard.jsx
   │   └── StatsWidget.jsx
   └── layout/
       ├── AppLayout.jsx
       ├── Sidebar.jsx
       └── Topbar.jsx
   ```

2. **Create the folders:**

   Run in terminal (from `frontend/` directory):
   ```bash
   mkdir src/components/atoms
   mkdir src/components/molecules
   mkdir src/components/organisms
   ```

**✓ Checkpoint:** Folder structure is ready.

---

### STEP 2.2: Build Button Component (Day 4 - Afternoon)

**What to do:**

1. **Create the Button component:**

   **Create file:** `frontend/src/components/atoms/Button.jsx`

   ```jsx
   import React from 'react';

   const Button = ({ 
     children, 
     variant = 'primary', 
     size = 'md', 
     fullWidth = false,
     disabled = false,
     loading = false,
     onClick,
     type = 'button',
     className = '',
     ...props 
   }) => {
     
     // Base styles
     const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
     
     // Variant styles
     const variants = {
       primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
       secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
       success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500',
       danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
       outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
       ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
     };
     
     // Size styles
     const sizes = {
       sm: 'px-3 py-1.5 text-sm',
       md: 'px-4 py-2 text-base',
       lg: 'px-6 py-3 text-lg',
       xl: 'px-8 py-4 text-xl',
     };
     
     const widthClass = fullWidth ? 'w-full' : '';
     
     const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;
     
     return (
       <button
         type={type}
         className={classes}
         onClick={onClick}
         disabled={disabled || loading}
         {...props}
       >
         {loading && (
           <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
         )}
         {children}
       </button>
     );
   };

   export default Button;
   ```

2. **Test the Button:**

   **Create file:** `frontend/src/components/atoms/ButtonShowcase.jsx`

   ```jsx
   import React from 'react';
   import Button from './Button';

   const ButtonShowcase = () => {
     return (
       <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
         <h1 className="text-3xl font-bold mb-6">Button Component Showcase</h1>
         
         {/* Variants */}
         <section>
           <h2 className="text-xl font-semibold mb-4">Variants</h2>
           <div className="flex flex-wrap gap-3">
             <Button variant="primary">Primary</Button>
             <Button variant="secondary">Secondary</Button>
             <Button variant="success">Success</Button>
             <Button variant="danger">Danger</Button>
             <Button variant="outline">Outline</Button>
             <Button variant="ghost">Ghost</Button>
           </div>
         </section>

         {/* Sizes */}
         <section>
           <h2 className="text-xl font-semibold mb-4">Sizes</h2>
           <div className="flex flex-wrap items-center gap-3">
             <Button size="sm">Small</Button>
             <Button size="md">Medium</Button>
             <Button size="lg">Large</Button>
             <Button size="xl">Extra Large</Button>
           </div>
         </section>

         {/* States */}
         <section>
           <h2 className="text-xl font-semibold mb-4">States</h2>
           <div className="flex flex-wrap gap-3">
             <Button>Normal</Button>
             <Button disabled>Disabled</Button>
             <Button loading>Loading</Button>
           </div>
         </section>

         {/* Full Width */}
         <section>
           <h2 className="text-xl font-semibold mb-4">Full Width</h2>
           <Button fullWidth>Full Width Button</Button>
         </section>
       </div>
     );
   };

   export default ButtonShowcase;
   ```

3. **Temporarily test in App.jsx:**

   **Open:** `frontend/src/App.jsx`

   Add import and render:
   ```jsx
   import ButtonShowcase from './components/atoms/ButtonShowcase';

   // Then in your return, temporarily render:
   // <ButtonShowcase />
   ```

**✓ Checkpoint:** You should see all button variations rendered beautifully.

---

### STEP 2.3: Build Input Component (Day 5 - Morning)

**What to do:**

1. **Create the Input component:**

   **Create file:** `frontend/src/components/atoms/Input.jsx`

   ```jsx
   import React from 'react';

   const Input = ({ 
     type = 'text',
     label,
     name,
     value,
     onChange,
     placeholder,
     error,
     disabled = false,
     required = false,
     icon,
     helpText,
     className = '',
     ...props 
   }) => {
     
     const inputClasses = `
       block w-full px-4 py-2.5 
       text-gray-900 bg-white 
       border rounded-lg
       transition-all duration-200
       focus:outline-none focus:ring-2 focus:ring-offset-0
       disabled:bg-gray-100 disabled:cursor-not-allowed
       ${error 
         ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200' 
         : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
       }
       ${icon ? 'pl-10' : ''}
       ${className}
     `;

     return (
       <div className="w-full">
         {label && (
           <label 
             htmlFor={name} 
             className="block text-sm font-medium text-gray-700 mb-1.5"
           >
             {label}
             {required && <span className="text-danger-500 ml-1">*</span>}
           </label>
         )}
         
         <div className="relative">
           {icon && (
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <span className="text-gray-400">{icon}</span>
             </div>
           )}
           
           <input
             type={type}
             name={name}
             id={name}
             value={value}
             onChange={onChange}
             placeholder={placeholder}
             disabled={disabled}
             required={required}
             className={inputClasses}
             {...props}
           />
         </div>

         {helpText && !error && (
           <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
         )}
         
         {error && (
           <p className="mt-1.5 text-sm text-danger-600 flex items-center">
             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             {error}
           </p>
         )}
       </div>
     );
   };

   export default Input;
   ```

2. **Create Select component:**

   **Create file:** `frontend/src/components/atoms/Select.jsx`

   ```jsx
   import React from 'react';

   const Select = ({ 
     label,
     name,
     value,
     onChange,
     options = [],
     error,
     disabled = false,
     required = false,
     placeholder = 'Select an option',
     className = '',
     ...props 
   }) => {
     
     const selectClasses = `
       block w-full px-4 py-2.5 
       text-gray-900 bg-white 
       border rounded-lg
       transition-all duration-200
       focus:outline-none focus:ring-2 focus:ring-offset-0
       disabled:bg-gray-100 disabled:cursor-not-allowed
       ${error 
         ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200' 
         : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
       }
       ${className}
     `;

     return (
       <div className="w-full">
         {label && (
           <label 
             htmlFor={name} 
             className="block text-sm font-medium text-gray-700 mb-1.5"
           >
             {label}
             {required && <span className="text-danger-500 ml-1">*</span>}
           </label>
         )}
         
         <select
           name={name}
           id={name}
           value={value}
           onChange={onChange}
           disabled={disabled}
           required={required}
           className={selectClasses}
           {...props}
         >
           <option value="">{placeholder}</option>
           {options.map((option) => (
             <option 
               key={option.value} 
               value={option.value}
             >
               {option.label}
             </option>
           ))}
         </select>
         
         {error && (
           <p className="mt-1.5 text-sm text-danger-600 flex items-center">
             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             {error}
           </p>
         )}
       </div>
     );
   };

   export default Select;
   ```

**✓ Checkpoint:** Input and Select components are ready with error states.

---

### STEP 2.4: Build Card Component (Day 5 - Afternoon)

**What to do:**

1. **Create the Card component:**

   **Create file:** `frontend/src/components/atoms/Card.jsx`

   ```jsx
   import React from 'react';

   const Card = ({ 
     children, 
     className = '',
     padding = 'md',
     shadow = 'card',
     hover = false,
     onClick,
     ...props 
   }) => {
     
     const paddingClasses = {
       none: '',
       sm: 'p-4',
       md: 'p-6',
       lg: 'p-8',
     };

     const shadowClasses = {
       none: '',
       card: 'shadow-card',
       md: 'shadow-md',
       lg: 'shadow-lg',
     };
     
     const baseClasses = 'bg-white rounded-xl border border-gray-100 transition-all duration-200';
     const hoverClasses = hover ? 'hover:shadow-card-hover cursor-pointer' : '';
     const clickableClasses = onClick ? 'cursor-pointer' : '';
     
     const classes = `
       ${baseClasses}
       ${paddingClasses[padding]}
       ${shadowClasses[shadow]}
       ${hoverClasses}
       ${clickableClasses}
       ${className}
     `;
     
     return (
       <div 
         className={classes}
         onClick={onClick}
         {...props}
       >
         {children}
       </div>
     );
   };

   // Card Header Component
   Card.Header = ({ children, className = '' }) => (
     <div className={`mb-4 ${className}`}>
       {children}
     </div>
   );

   // Card Title Component
   Card.Title = ({ children, className = '' }) => (
     <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
       {children}
     </h3>
   );

   // Card Description Component
   Card.Description = ({ children, className = '' }) => (
     <p className={`text-sm text-gray-600 mt-1 ${className}`}>
       {children}
     </p>
   );

   // Card Body Component
   Card.Body = ({ children, className = '' }) => (
     <div className={className}>
       {children}
     </div>
   );

   // Card Footer Component
   Card.Footer = ({ children, className = '' }) => (
     <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
       {children}
     </div>
   );

   export default Card;
   ```

**✓ Checkpoint:** Card component with subcomponents is ready.

---

### STEP 2.5: Build Badge Component (Day 6 - Morning)

**What to do:**

1. **Create the Badge component:**

   **Create file:** `frontend/src/components/atoms/Badge.jsx`

   ```jsx
   import React from 'react';

   const Badge = ({ 
     children, 
     variant = 'default',
     size = 'md',
     rounded = 'full',
     className = '',
     ...props 
   }) => {
     
     const variants = {
       default: 'bg-gray-100 text-gray-800',
       primary: 'bg-primary-100 text-primary-800',
       success: 'bg-success-100 text-success-800',
       danger: 'bg-danger-100 text-danger-800',
       warning: 'bg-warning-100 text-warning-800',
       info: 'bg-blue-100 text-blue-800',
     };

     const sizes = {
       sm: 'px-2 py-0.5 text-xs',
       md: 'px-2.5 py-1 text-sm',
       lg: 'px-3 py-1.5 text-base',
     };

     const roundedClasses = {
       none: '',
       sm: 'rounded-sm',
       md: 'rounded-md',
       lg: 'rounded-lg',
       full: 'rounded-full',
     };
     
     const classes = `
       inline-flex items-center font-medium
       ${variants[variant]}
       ${sizes[size]}
       ${roundedClasses[rounded]}
       ${className}
     `;
     
     return (
       <span className={classes} {...props}>
         {children}
       </span>
     );
   };

   export default Badge;
   ```

**✓ Checkpoint:** Badge component is ready.

---

### STEP 2.6: Build Spinner Component (Day 6 - Afternoon)

**What to do:**

1. **Create the Spinner component:**

   **Create file:** `frontend/src/components/atoms/Spinner.jsx`

   ```jsx
   import React from 'react';

   const Spinner = ({ 
     size = 'md',
     color = 'primary',
     className = '',
     ...props 
   }) => {
     
     const sizes = {
       xs: 'h-3 w-3',
       sm: 'h-4 w-4',
       md: 'h-6 w-6',
       lg: 'h-8 w-8',
       xl: 'h-12 w-12',
     };

     const colors = {
       primary: 'text-primary-500',
       white: 'text-white',
       gray: 'text-gray-500',
     };
     
     return (
       <svg
         className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         {...props}
       >
         <circle
           className="opacity-25"
           cx="12"
           cy="12"
           r="10"
           stroke="currentColor"
           strokeWidth="4"
         />
         <path
           className="opacity-75"
           fill="currentColor"
           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
         />
       </svg>
     );
   };

   // Full Page Spinner
   export const PageSpinner = ({ message = 'Loading...' }) => (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
       <Spinner size="xl" />
       {message && (
         <p className="mt-4 text-gray-600 font-medium">{message}</p>
       )}
     </div>
   );

   export default Spinner;
   ```

**✓ Checkpoint:** Spinner component is ready.

---

### STEP 2.7: Build Alert Component - Molecule (Day 7 - Morning)

**What to do:**

1. **Create the Alert component:**

   **Create file:** `frontend/src/components/molecules/Alert.jsx`

   ```jsx
   import React, { useState } from 'react';

   const Alert = ({ 
     children,
     variant = 'info',
     title,
     dismissible = false,
     onDismiss,
     className = '',
     ...props 
   }) => {
     const [isVisible, setIsVisible] = useState(true);

     const variants = {
       info: {
         bg: 'bg-blue-50',
         border: 'border-blue-200',
         text: 'text-blue-800',
         icon: (
           <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
           </svg>
         ),
       },
       success: {
         bg: 'bg-success-50',
         border: 'border-success-200',
         text: 'text-success-800',
         icon: (
           <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
         ),
       },
       warning: {
         bg: 'bg-warning-50',
         border: 'border-warning-200',
         text: 'text-warning-800',
         icon: (
           <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
         ),
       },
       danger: {
         bg: 'bg-danger-50',
         border: 'border-danger-200',
         text: 'text-danger-800',
         icon: (
           <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
           </svg>
         ),
       },
     };

     const handleDismiss = () => {
       setIsVisible(false);
       onDismiss && onDismiss();
     };

     if (!isVisible) return null;

     const { bg, border, text, icon } = variants[variant];

     return (
       <div 
         className={`${bg} ${border} ${text} border rounded-lg p-4 ${className}`}
         role="alert"
         {...props}
       >
         <div className="flex">
           <div className="flex-shrink-0">
             {icon}
           </div>
           <div className="ml-3 flex-1">
             {title && (
               <h3 className="text-sm font-medium mb-1">
                 {title}
               </h3>
             )}
             <div className="text-sm">
               {children}
             </div>
           </div>
           {dismissible && (
             <button
               onClick={handleDismiss}
               className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-black hover:bg-opacity-10 transition-colors"
             >
               <span className="sr-only">Dismiss</span>
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
           )}
         </div>
       </div>
     );
   };

   export default Alert;
   ```

**✓ Checkpoint:** Alert component with all variants is ready.

---

### STEP 2.8: Build Modal Component - Molecule (Day 7 - Afternoon)

**What to do:**

1. **Create the Modal component:**

   **Create file:** `frontend/src/components/molecules/Modal.jsx`

   ```jsx
   import React, { useEffect } from 'react';
   import Button from '../atoms/Button';

   const Modal = ({ 
     isOpen,
     onClose,
     title,
     children,
     footer,
     size = 'md',
     className = '',
     ...props 
   }) => {
     
     // Close on ESC key
     useEffect(() => {
       const handleEsc = (e) => {
         if (e.key === 'Escape' && isOpen) {
           onClose();
         }
       };
       window.addEventListener('keydown', handleEsc);
       return () => window.removeEventListener('keydown', handleEsc);
     }, [isOpen, onClose]);

     // Prevent body scroll when modal is open
     useEffect(() => {
       if (isOpen) {
         document.body.style.overflow = 'hidden';
       } else {
         document.body.style.overflow = 'unset';
       }
       return () => {
         document.body.style.overflow = 'unset';
       };
     }, [isOpen]);

     if (!isOpen) return null;

     const sizes = {
       sm: 'max-w-md',
       md: 'max-w-lg',
       lg: 'max-w-2xl',
       xl: 'max-w-4xl',
       full: 'max-w-7xl',
     };

     return (
       <div 
         className="fixed inset-0 z-50 overflow-y-auto"
         aria-labelledby="modal-title"
         role="dialog"
         aria-modal="true"
       >
         {/* Backdrop */}
         <div 
           className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
           onClick={onClose}
         />

         {/* Modal Container */}
         <div className="flex min-h-screen items-center justify-center p-4">
           <div 
             className={`
               relative bg-white rounded-xl shadow-xl 
               transform transition-all w-full
               ${sizes[size]}
               ${className}
             `}
             onClick={(e) => e.stopPropagation()}
             {...props}
           >
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h3 
                 className="text-xl font-semibold text-gray-900"
                 id="modal-title"
               >
                 {title}
               </h3>
               <button
                 onClick={onClose}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             {/* Body */}
             <div className="p-6">
               {children}
             </div>

             {/* Footer */}
             {footer && (
               <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                 {footer}
               </div>
             )}
           </div>
         </div>
       </div>
     );
   };

   export default Modal;
   ```

**✓ Checkpoint:** Modal component with backdrop and animations is ready.

---

### STEP 2.9: Build FormGroup Component - Molecule (Day 8 - Morning)

**What to do:**

1. **Create the FormGroup component:**

   **Create file:** `frontend/src/components/molecules/FormGroup.jsx`

   ```jsx
   import React from 'react';
   import Input from '../atoms/Input';
   import Select from '../atoms/Select';

   const FormGroup = ({ 
     type = 'text',
     inputType = 'input', // 'input' or 'select'
     label,
     name,
     value,
     onChange,
     error,
     required = false,
     placeholder,
     options, // for select
     helpText,
     icon,
     className = '',
     ...props 
   }) => {
     
     return (
       <div className={`mb-4 ${className}`}>
         {inputType === 'select' ? (
           <Select
             label={label}
             name={name}
             value={value}
             onChange={onChange}
             options={options}
             error={error}
             required={required}
             placeholder={placeholder}
             {...props}
           />
         ) : (
           <Input
             type={type}
             label={label}
             name={name}
             value={value}
             onChange={onChange}
             error={error}
             required={required}
             placeholder={placeholder}
             icon={icon}
             helpText={helpText}
             {...props}
           />
         )}
       </div>
     );
   };

   export default FormGroup;
   ```

**✓ Checkpoint:** FormGroup wrapper is ready.

---

## STAGE 3: Advanced UI Features

**Duration:** 4-5 days  
**Objective:** Add polish with animations, charts, and enhanced interactions

---

### STEP 3.1: Install Animation Library (Day 9 - Morning)

**What to do:**

1. **Install Framer Motion:**

   Run in terminal (from `frontend/` directory):
   ```bash
   npm install framer-motion
   ```

2. **Create animated components:**

   **Create file:** `frontend/src/components/atoms/AnimatedDiv.jsx`

   ```jsx
   import { motion } from 'framer-motion';

   // Fade In Animation
   export const FadeIn = ({ children, delay = 0, className = '' }) => (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.3, delay }}
       className={className}
     >
       {children}
     </motion.div>
   );

   // Slide In Up Animation
   export const SlideInUp = ({ children, delay = 0, className = '' }) => (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay }}
       className={className}
     >
       {children}
     </motion.div>
   );

   // Scale In Animation
   export const ScaleIn = ({ children, delay = 0, className = '' }) => (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.3, delay }}
       className={className}
     >
       {children}
     </motion.div>
   );

   // Stagger Children Animation
   export const StaggerContainer = ({ children, className = '' }) => (
     <motion.div
       initial="hidden"
       animate="visible"
       variants={{
         visible: {
           transition: {
             staggerChildren: 0.1
           }
         }
       }}
       className={className}
     >
       {children}
     </motion.div>
   );

   export const StaggerItem = ({ children, className = '' }) => (
     <motion.div
       variants={{
         hidden: { opacity: 0, y: 20 },
         visible: { opacity: 1, y: 0 }
       }}
       className={className}
     >
       {children}
     </motion.div>
   );
   ```

**✓ Checkpoint:** Animation components are ready.

---

### STEP 3.2: Install Chart Library (Day 9 - Afternoon)

**What to do:**

1. **Install Recharts:**

   Run in terminal:
   ```bash
   npm install recharts
   ```

2. **Create a Chart wrapper component:**

   **Create file:** `frontend/src/components/organisms/LineChartWidget.jsx`

   ```jsx
   import React from 'react';
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
   import Card from '../atoms/Card';

   const LineChartWidget = ({ 
     title, 
     data = [], 
     dataKeys = [],
     colors = ['#0ea5e9', '#22c55e'],
     height = 300,
   }) => {
     return (
       <Card>
         <Card.Header>
           <Card.Title>{title}</Card.Title>
         </Card.Header>
         <Card.Body>
           <ResponsiveContainer width="100%" height={height}>
             <LineChart data={data}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
               <XAxis 
                 dataKey="name" 
                 stroke="#6b7280"
                 style={{ fontSize: '12px' }}
               />
               <YAxis 
                 stroke="#6b7280"
                 style={{ fontSize: '12px' }}
               />
               <Tooltip 
                 contentStyle={{
                   backgroundColor: '#fff',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                 }}
               />
               <Legend />
               {dataKeys.map((key, index) => (
                 <Line 
                   key={key}
                   type="monotone" 
                   dataKey={key} 
                   stroke={colors[index] || colors[0]}
                   strokeWidth={2}
                   dot={{ fill: colors[index] || colors[0], r: 4 }}
                   activeDot={{ r: 6 }}
                 />
               ))}
             </LineChart>
           </ResponsiveContainer>
         </Card.Body>
       </Card>
     );
   };

   export default LineChartWidget;
   ```

3. **Create a Bar Chart component:**

   **Create file:** `frontend/src/components/organisms/BarChartWidget.jsx`

   ```jsx
   import React from 'react';
   import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
   import Card from '../atoms/Card';

   const BarChartWidget = ({ 
     title, 
     data = [], 
     dataKeys = [],
     colors = ['#0ea5e9', '#ef4444'],
     height = 300,
   }) => {
     return (
       <Card>
         <Card.Header>
           <Card.Title>{title}</Card.Title>
         </Card.Header>
         <Card.Body>
           <ResponsiveContainer width="100%" height={height}>
             <BarChart data={data}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
               <XAxis 
                 dataKey="name" 
                 stroke="#6b7280"
                 style={{ fontSize: '12px' }}
               />
               <YAxis 
                 stroke="#6b7280"
                 style={{ fontSize: '12px' }}
               />
               <Tooltip 
                 contentStyle={{
                   backgroundColor: '#fff',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                 }}
               />
               <Legend />
               {dataKeys.map((key, index) => (
                 <Bar 
                   key={key}
                   dataKey={key} 
                   fill={colors[index] || colors[0]}
                   radius={[8, 8, 0, 0]}
                 />
               ))}
             </BarChart>
           </ResponsiveContainer>
         </Card.Body>
       </Card>
     );
   };

   export default BarChartWidget;
   ```

**✓ Checkpoint:** Chart components are ready for use.

---

### STEP 3.3: Create Toast Notification System (Day 10 - Morning)

**What to do:**

1. **Install react-hot-toast:**

   Run in terminal:
   ```bash
   npm install react-hot-toast
   ```

2. **Set up Toast provider:**

   **Open:** `frontend/src/App.jsx`

   **Add at the top:**
   ```jsx
   import { Toaster } from 'react-hot-toast';
   ```

   **Add in your JSX before closing tag:**
   ```jsx
   <Toaster
     position="top-right"
     toastOptions={{
       duration: 4000,
       style: {
         background: '#fff',
         color: '#374151',
         padding: '16px',
         borderRadius: '12px',
         boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
       },
       success: {
         iconTheme: {
           primary: '#22c55e',
           secondary: '#fff',
         },
       },
       error: {
         iconTheme: {
           primary: '#ef4444',
           secondary: '#fff',
         },
       },
     }}
   />
   ```

3. **Create toast utility:**

   **Create file:** `frontend/src/utils/toast.js`

   ```javascript
   import toast from 'react-hot-toast';

   export const showSuccess = (message) => {
     toast.success(message);
   };

   export const showError = (message) => {
     toast.error(message);
   };

   export const showLoading = (message) => {
     return toast.loading(message);
   };

   export const dismissToast = (toastId) => {
     toast.dismiss(toastId);
   };

   export const showPromise = (promise, messages) => {
     return toast.promise(promise, {
       loading: messages.loading || 'Loading...',
       success: messages.success || 'Success!',
       error: messages.error || 'Error occurred',
     });
   };
   ```

**✓ Checkpoint:** Toast system is ready. Test with `showSuccess('Hello!')`.

---

### STEP 3.4: Create Stats Widget Component (Day 10 - Afternoon)

**What to do:**

1. **Create Stats Card:**

   **Create file:** `frontend/src/components/organisms/StatsCard.jsx`

   ```jsx
   import React from 'react';
   import { motion } from 'framer-motion';
   import Card from '../atoms/Card';

   const StatsCard = ({ 
     title, 
     value, 
     icon,
     trend, // { value: 12, isPositive: true }
     color = 'primary',
     delay = 0,
   }) => {
     
     const colorClasses = {
       primary: 'bg-primary-500',
       success: 'bg-success-500',
       danger: 'bg-danger-500',
       warning: 'bg-warning-500',
     };

     return (
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3, delay }}
       >
         <Card hover className="h-full">
           <div className="flex items-start justify-between">
             <div className="flex-1">
               <p className="text-sm font-medium text-gray-600 mb-1">
                 {title}
               </p>
               <h3 className="text-3xl font-bold text-gray-900">
                 {value}
               </h3>
               {trend && (
                 <div className="flex items-center mt-2">
                   <span className={`text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                     {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                   </span>
                   <span className="text-sm text-gray-500 ml-2">vs last month</span>
                 </div>
               )}
             </div>
             {icon && (
               <div className={`${colorClasses[color]} p-3 rounded-xl text-white`}>
                 {icon}
               </div>
             )}
           </div>
         </Card>
       </motion.div>
     );
   };

   export default StatsCard;
   ```

**✓ Checkpoint:** Stats card with trend indicators is ready.

---

### STEP 3.5: Create Skeleton Loaders (Day 11 - Morning)

**What to do:**

1. **Create Skeleton component:**

   **Create file:** `frontend/src/components/atoms/Skeleton.jsx`

   ```jsx
   import React from 'react';

   export const Skeleton = ({ className = '', variant = 'rect' }) => {
     const baseClasses = 'animate-pulse bg-gray-200';
     
     const variants = {
       rect: 'rounded',
       circle: 'rounded-full',
       text: 'rounded h-4',
     };

     return (
       <div className={`${baseClasses} ${variants[variant]} ${className}`} />
     );
   };

   export const SkeletonCard = () => (
     <div className="bg-white rounded-xl p-6 shadow-card">
       <div className="flex items-start justify-between mb-4">
         <div className="flex-1">
           <Skeleton className="h-4 w-24 mb-3" />
           <Skeleton className="h-8 w-32" />
         </div>
         <Skeleton variant="circle" className="h-12 w-12" />
       </div>
       <Skeleton className="h-3 w-full" />
     </div>
   );

   export const SkeletonTable = ({ rows = 5 }) => (
     <div className="bg-white rounded-xl shadow-card overflow-hidden">
       <div className="p-4 border-b">
         <Skeleton className="h-6 w-32" />
       </div>
       {Array.from({ length: rows }).map((_, i) => (
         <div key={i} className="p-4 border-b flex items-center gap-4">
           <Skeleton className="h-10 w-10 rounded-lg" />
           <div className="flex-1">
             <Skeleton className="h-4 w-3/4 mb-2" />
             <Skeleton className="h-3 w-1/2" />
           </div>
           <Skeleton className="h-8 w-20" />
         </div>
       ))}
     </div>
   );

   export default Skeleton;
   ```

**✓ Checkpoint:** Skeleton loaders for smooth loading states are ready.

---

## STAGE 4: Responsive & Accessible Design

**Duration:** 3-4 days  
**Objective:** Ensure mobile-friendly and accessible for all users

---

### STEP 4.1: Configure Responsive Breakpoints (Day 12 - Morning)

**What to do:**

1. **Verify Tailwind breakpoints:**

   **Open:** `frontend/tailwind.config.js`

   **Ensure these breakpoints exist (they're default):**
   ```javascript
   theme: {
     screens: {
       'sm': '640px',   // Small devices
       'md': '768px',   // Tablets
       'lg': '1024px',  // Laptops
       'xl': '1280px',  // Desktops
       '2xl': '1536px', // Large screens
     },
   }
   ```

2. **Test responsive design:**

   Use these classes in your components:
   ```jsx
   <div className="
     grid 
     grid-cols-1        // 1 column on mobile
     md:grid-cols-2     // 2 columns on tablets
     lg:grid-cols-3     // 3 columns on laptops
     xl:grid-cols-4     // 4 columns on desktops
     gap-4
   ">
     {/* Your content */}
   </div>
   ```

**✓ Checkpoint:** Responsive grid system is configured.

---

### STEP 4.2: Make Sidebar Responsive (Day 12 - Afternoon)

**What to do:**

1. **Update Sidebar component:**

   **Open:** `frontend/src/components/layout/Sidebar.jsx`

   **Add mobile menu toggle:**
   ```jsx
   import { useState } from 'react';

   const Sidebar = () => {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

     return (
       <>
         {/* Mobile menu button */}
         <button
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
         >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
           </svg>
         </button>

         {/* Sidebar */}
         <aside className={`
           fixed lg:static inset-y-0 left-0 z-40
           w-64 bg-white border-r border-gray-200
           transform transition-transform duration-300 ease-in-out
           ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
         `}>
           {/* Your sidebar content */}
         </aside>

         {/* Mobile overlay */}
         {isMobileMenuOpen && (
           <div 
             className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
             onClick={() => setIsMobileMenuOpen(false)}
           />
         )}
       </>
     );
   };
   ```

**✓ Checkpoint:** Sidebar is now mobile-friendly.

---

### STEP 4.3: Add Accessibility Features (Day 13 - Morning)

**What to do:**

1. **Update Button component with ARIA:**

   **Open:** `frontend/src/components/atoms/Button.jsx`

   **Add these attributes:**
   ```jsx
   <button
     // ... existing props
     aria-label={ariaLabel}
     aria-disabled={disabled}
     aria-busy={loading}
   >
   ```

2. **Add focus styles to all interactive elements:**

   **Add to** `frontend/src/index.css`:
   ```css
   /* Enhanced focus indicators */
   *:focus {
     outline: 2px solid transparent;
     outline-offset: 2px;
   }

   *:focus-visible {
     outline: 2px solid #0ea5e9;
     outline-offset: 2px;
   }

   /* Remove default focus for mouse users */
   *:focus:not(:focus-visible) {
     outline: none;
   }
   ```

3. **Add skip to main content link:**

   **Open:** `frontend/src/App.jsx`

   **Add at the very top of your JSX:**
   ```jsx
   <a 
     href="#main-content" 
     className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
   >
     Skip to main content
   </a>
   ```

**✓ Checkpoint:** Basic accessibility features are in place.

---

### STEP 4.4: Test with Accessibility Tools (Day 13 - Afternoon)

**What to do:**

1. **Install browser extensions:**
   - [axe DevTools](https://www.deque.com/axe/devtools/) - Chrome/Firefox
   - [WAVE](https://wave.webaim.org/extension/) - Chrome/Firefox

2. **Run Lighthouse audit:**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Check "Accessibility"
   - Generate report
   - Fix issues with score < 90

3. **Test keyboard navigation:**
   - Navigate your entire app using only Tab, Enter, Escape
   - Ensure all interactive elements are reachable
   - Ensure focus is visible
   - Test forms completely via keyboard

4. **Test screen reader** (optional but recommended):
   - Windows: NVDA (free)
   - Mac: VoiceOver (built-in)
   - Test critical user flows

**✓ Checkpoint:** Accessibility score is above 90 on Lighthouse.

---

### STEP 4.5: Add Dark Mode Support (Day 14 - Optional)

**What to do:**

1. **Enable dark mode in Tailwind:**

   **Open:** `frontend/tailwind.config.js`

   **Add:**
   ```javascript
   module.exports = {
     darkMode: 'class', // Enable class-based dark mode
     // ... rest of config
   }
   ```

2. **Create dark mode toggle:**

   **Create file:** `frontend/src/components/atoms/DarkModeToggle.jsx`

   ```jsx
   import { useState, useEffect } from 'react';

   const DarkModeToggle = () => {
     const [isDark, setIsDark] = useState(false);

     useEffect(() => {
       const isDarkMode = localStorage.getItem('darkMode') === 'true';
       setIsDark(isDarkMode);
       if (isDarkMode) {
         document.documentElement.classList.add('dark');
       }
     }, []);

     const toggleDarkMode = () => {
       const newMode = !isDark;
       setIsDark(newMode);
       localStorage.setItem('darkMode', newMode);
       document.documentElement.classList.toggle('dark');
     };

     return (
       <button
         onClick={toggleDarkMode}
         className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
         aria-label="Toggle dark mode"
       >
         {isDark ? (
           <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
           </svg>
         ) : (
           <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
             <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
           </svg>
         )}
       </button>
     );
   };

   export default DarkModeToggle;
   ```

3. **Add dark mode classes to components:**

   Example for Card:
   ```jsx
   <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
   ```

**✓ Checkpoint:** Dark mode toggle works and persists.

---

## Final Checklist

### Design System Completeness

- [ ] **Colors**
  - [ ] All color scales defined (50-950)
  - [ ] Semantic colors (primary, success, danger, warning)
  - [ ] All colors pass WCAG contrast requirements

- [ ] **Typography**
  - [ ] Fonts loaded and configured
  - [ ] Complete size scale (xs to 6xl)
  - [ ] Font weights defined
  - [ ] Line heights set

- [ ] **Spacing**
  - [ ] Consistent spacing scale
  - [ ] Border radius system
  - [ ] Shadow/elevation system

- [ ] **Components - Atoms**
  - [ ] Button (all variants and sizes)
  - [ ] Input (with validation states)
  - [ ] Select dropdown
  - [ ] Badge
  - [ ] Card
  - [ ] Spinner/Loader
  - [ ] Skeleton loaders

- [ ] **Components - Molecules**
  - [ ] FormGroup
  - [ ] Alert/Notification
  - [ ] Modal/Dialog
  - [ ] Search bar
  - [ ] Toast notifications

- [ ] **Components - Organisms**
  - [ ] Stats cards
  - [ ] Chart components
  - [ ] Data tables
  - [ ] Navigation components

- [ ] **Animations**
  - [ ] Framer Motion installed
  - [ ] Page transitions
  - [ ] Component entrance animations
  - [ ] Hover effects
  - [ ] Loading states

- [ ] **Responsiveness**
  - [ ] Mobile-first approach
  - [ ] Breakpoints configured
  - [ ] Sidebar responsive
  - [ ] Tables responsive
  - [ ] Forms responsive
  - [ ] Tested on real devices

- [ ] **Accessibility**
  - [ ] ARIA labels on interactive elements
  - [ ] Keyboard navigation works
  - [ ] Focus indicators visible
  - [ ] Color contrast verified
  - [ ] Screen reader tested (optional)
  - [ ] Lighthouse score > 90

- [ ] **Polish**
  - [ ] Consistent spacing throughout
  - [ ] Smooth transitions
  - [ ] Loading states everywhere
  - [ ] Error states handled
  - [ ] Empty states designed
  - [ ] Icons consistent

---

## Appendix: Quick Reference

### Most Used Tailwind Classes

**Layout:**
```
flex, grid, container
justify-center, items-center
gap-4, space-y-4
w-full, h-full
max-w-7xl, min-h-screen
```

**Spacing:**
```
p-4 (padding all sides)
px-4 (padding left/right)
py-4 (padding top/bottom)
m-4 (margin)
mt-4 (margin top)
```

**Colors:**
```
bg-primary-500
text-gray-900
border-gray-300
hover:bg-primary-600
```

**Typography:**
```
text-sm, text-base, text-xl
font-medium, font-semibold, font-bold
leading-tight, leading-normal
```

**Borders & Shadows:**
```
rounded-lg, rounded-xl, rounded-full
border, border-2
shadow-sm, shadow-md, shadow-lg
```

**Responsive:**
```
md:grid-cols-2 (applies at md breakpoint)
lg:w-1/2
hidden lg:block
```

### Color Usage Guide

- **Primary (Blue):** Main actions, links, highlights
- **Success (Green):** Income, positive trends, success messages
- **Danger (Red):** Expenses, errors, destructive actions
- **Warning (Orange):** Alerts, approaching limits, cautions
- **Gray:** Text, borders, backgrounds, neutral elements

### Animation Patterns

```jsx
// Fade in
<FadeIn>Content</FadeIn>

// Slide in from bottom
<SlideInUp delay={0.1}>Content</SlideInUp>

// Stagger children
<StaggerContainer>
  <StaggerItem>Item 1</StaggerItem>
  <StaggerItem>Item 2</StaggerItem>
</StaggerContainer>
```

### Common Patterns

**Responsive Grid:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Card with hover:**
```jsx
<Card hover shadow="card">
```

**Form field:**
```jsx
<FormGroup
  label="Email"
  name="email"
  type="email"
  required
  error={errors.email}
/>
```

**Stats display:**
```jsx
<StatsCard
  title="Total Income"
  value="$12,345"
  icon={<Icon />}
  trend={{ value: 12, isPositive: true }}
  color="success"
/>
```

---

## Next Steps

After completing this guide:

1. **Apply to existing pages:**
   - Update Dashboard page with new components
   - Redesign Login/Register forms
   - Enhance Transaction pages
   - Improve Analytics page

2. **Test thoroughly:**
   - Test on mobile devices
   - Test all breakpoints
   - Test keyboard navigation
   - Run Lighthouse audits

3. **Document your components:**
   - Create a component showcase page
   - Document props for each component
   - Add usage examples

4. **Continue to Phase 3** of the roadmap (Feature Development)

---

**Congratulations!** You now have a professional, production-ready design system. 🎨

Your app should look modern, feel smooth, and work beautifully across all devices.
