import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing SFT Platform...');

  useEffect(() => {
    const texts = [
      'Initializing SFT Platform...',
      'Loading Financial Modules...',
      'Connecting to Secure Database...',
      'Preparing Your Dashboard...',
      'Almost Ready!'
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 800);

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = texts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Official SFT Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img 
              src="/logo-sft.svg" 
              alt="SFT Logo" 
              className="w-32 h-32 drop-shadow-2xl animate-pulse"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 dark:from-blue-400 dark:via-blue-500 dark:to-green-400 bg-clip-text text-transparent mb-2">
            Smart Financial Tracker
          </h1>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 tracking-wider">
            SFT PLATFORM
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Professional Financial Management Solution
          </p>
        </div>

        {/* Loading Progress */}
        <div className="w-80 max-w-md mx-auto mb-8">
          <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Version and Copyright */}
        <div className="mt-16 text-xs text-gray-400 dark:text-gray-600">
          <p>Version 1.0.0 | Enterprise Grade Security</p>
          <p className="mt-1">© 2026 Smart Financial Tracker. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;