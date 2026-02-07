/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Primary brand color (Vibrant Purple-Blue Gradient)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',  // Main primary - Rich Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Premium Secondary/accent color (Vibrant Pink-Rose)
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  // Main secondary - Hot Pink
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
          950: '#500724',
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
        // Premium Light Theme Colors (Heaven - Clean & Bright)
        light: {
          bg: {
            primary: '#f8f9fb',      // Soft blue-white for main backgrounds
            secondary: '#ffffff',    // Pure white for cards
            tertiary: '#f0f4f8',     // Light blue-gray for sections
            accent: '#e6f0fa',       // Subtle blue accent
          },
          surface: {
            primary: '#ffffff',      // White card backgrounds
            secondary: '#fafbfd',    // Soft white secondary
            elevated: '#ffffff',     // Elevated surfaces (with shadow)
            hover: '#f0f7ff',        // Cyan-tinted hover
          },
          border: {
            light: '#e1e8f0',        // Very light blue borders
            default: '#cbd5e1',      // Default blue-gray borders
            strong: '#94a3b8',       // Strong borders
          },
          text: {
            primary: '#0f172a',      // Deep navy text
            secondary: '#475569',    // Medium gray text
            tertiary: '#64748b',     // Light gray text
            disabled: '#cbd5e1',     // Disabled text
          },
        },
        // Premium Dark Theme - Luxury Gold & Black (Professional Finance App)
        dark: {
          bg: {
            primary: '#0a0a0a',      // Pure black background
            secondary: '#121212',    // Slightly lighter black
            tertiary: '#1a1a1a',     // Elevated black
            accent: '#1f1f1f',       // Accent dark gray
          },
          surface: {
            primary: '#141414',      // Card backgrounds - deep black
            secondary: '#1a1a1a',    // Secondary cards
            elevated: '#1f1f1f',     // Elevated surfaces
            hover: '#252525',        // Subtle hover
          },
          border: {
            light: '#2a2a2a',        // Very subtle borders
            default: '#333333',      // Default borders
            strong: '#404040',       // Strong borders with gold tint
          },
          text: {
            primary: '#ffffff',      // Pure white text
            secondary: '#b8b8b8',    // Medium gray text
            tertiary: '#808080',     // Muted gray text
            disabled: '#4a4a4a',     // Disabled text
          },
        },
        // Premium Gold Accent (Luxury Finance)
        gold: {
          50: '#fffef7',
          100: '#fffaeb',
          200: '#fff4cc',
          300: '#ffe99d',
          400: '#ffd966',
          500: '#ffc940',  // Main gold accent
          600: '#f5b800',
          700: '#d4a000',
          800: '#a67c00',
          900: '#7a5a00',
        },
        // Cyan Accent (for both themes)
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // Main cyan accent
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Refined neutral grays (Enhanced for better gradation)
        gray: {
          50: '#fafbfc',
          100: '#f5f7fa',
          200: '#e4e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0e14',
        },
      },
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
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        // Premium Light Theme Shadows (Heaven)
        'card': '0 2px 8px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 8px 24px rgba(15, 23, 42, 0.12)',
        'premium': '0 4px 20px rgba(15, 23, 42, 0.06)',
        'premium-hover': '0 8px 32px rgba(6, 182, 212, 0.15)',  // Cyan glow on hover
        'elevated': '0 20px 40px rgba(15, 23, 42, 0.1)',
        // Premium Dark Theme Shadows (Luxury Gold & Black)
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 201, 64, 0.05)',
        'card-dark-hover': '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 201, 64, 0.1)',
        'glow-gold': '0 0 30px rgba(255, 201, 64, 0.2), 0 0 60px rgba(255, 201, 64, 0.1)',
        'glow-gold-strong': '0 0 40px rgba(255, 201, 64, 0.4), 0 0 80px rgba(255, 201, 64, 0.15)',
        'elevated-dark': '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 201, 64, 0.15)',
        'inner-glow': 'inset 0 1px 2px rgba(255, 201, 64, 0.08)',
      },
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
    },
  },
  plugins: [],
};
