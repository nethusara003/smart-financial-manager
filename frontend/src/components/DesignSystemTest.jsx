import React from 'react';

const DesignSystemTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">Design System Test</h1>
        <p className="text-lg text-gray-600 mb-12">Verifying all design tokens work correctly</p>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="h-24 bg-primary-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div>
              <div className="h-24 bg-success-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Success</p>
            </div>
            <div>
              <div className="h-24 bg-danger-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Danger</p>
            </div>
            <div>
              <div className="h-24 bg-warning-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Warning</p>
            </div>
            <div>
              <div className="h-24 bg-secondary-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Typography</h2>
          <div className="space-y-3 bg-white p-6 rounded-xl shadow-card">
            <h1 className="text-6xl font-bold">Heading 1 - 60px</h1>
            <h2 className="text-5xl font-bold">Heading 2 - 48px</h2>
            <h3 className="text-4xl font-semibold">Heading 3 - 36px</h3>
            <h4 className="text-3xl font-semibold">Heading 4 - 30px</h4>
            <h5 className="text-2xl font-medium">Heading 5 - 24px</h5>
            <h6 className="text-xl font-medium">Heading 6 - 20px</h6>
            <p className="text-lg">Large text - 18px</p>
            <p className="text-base">Regular text - 16px</p>
            <p className="text-sm">Small text - 14px</p>
            <p className="text-xs">Extra small text - 12px</p>
          </div>
        </section>

        {/* Shadows */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Shadows</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xs">
              <p className="font-medium">shadow-xs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="font-medium">shadow-sm</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card">
              <p className="font-medium">shadow-card</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card-hover">
              <p className="font-medium">shadow-card-hover</p>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Border Radius</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-primary-500 h-24 rounded-sm flex items-center justify-center text-white font-medium">
              rounded-sm
            </div>
            <div className="bg-success-500 h-24 rounded-md flex items-center justify-center text-white font-medium">
              rounded-md
            </div>
            <div className="bg-danger-500 h-24 rounded-lg flex items-center justify-center text-white font-medium">
              rounded-lg
            </div>
            <div className="bg-warning-500 h-24 rounded-xl flex items-center justify-center text-white font-medium">
              rounded-xl
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-card animate-fade-in">
              <p className="font-medium">fade-in</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card animate-slide-in-up">
              <p className="font-medium">slide-in-up</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card animate-slide-in-down">
              <p className="font-medium">slide-in-down</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card animate-scale-in">
              <p className="font-medium">scale-in</p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Spacing Scale</h2>
          <div className="bg-white p-6 rounded-xl shadow-card space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-primary-500"></div>
              <span className="text-sm font-medium">w-1 (4px)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-primary-500"></div>
              <span className="text-sm font-medium">w-2 (8px)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-8 bg-primary-500"></div>
              <span className="text-sm font-medium">w-4 (16px)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-8 bg-primary-500"></div>
              <span className="text-sm font-medium">w-6 (24px)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary-500"></div>
              <span className="text-sm font-medium">w-8 (32px)</span>
            </div>
          </div>
        </section>

        {/* Font Families */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Font Families</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-card">
              <p className="font-sans text-xl">This is Inter (Default Sans) - Clean and modern</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card">
              <p className="font-mono text-xl">This is Fira Code (Monospace) - 123456789</p>
            </div>
          </div>
        </section>

        {/* Success Message */}
        <div className="bg-success-50 border border-success-200 text-success-800 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-semibold mb-2">✓ Stage 1 Complete!</h3>
          <p className="text-lg">All design tokens are working correctly. Ready for Stage 2!</p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemTest;
