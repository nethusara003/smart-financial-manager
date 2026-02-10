import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Component to show when a feature is restricted for guest users
 */
const GuestRestricted = ({ featureName = "This feature" }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-8 shadow-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-800/50 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-2">
          Guest Access Limited
        </h2>
        
        <p className="text-amber-700 dark:text-amber-400 mb-6">
          {featureName} is not available in guest mode. Create a free account to unlock all features!
        </p>
        
        <div className="space-y-3">
          <Link
            to="/register"
            className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Create Free Account
          </Link>
          
          <Link
            to="/dashboard"
            className="block w-full px-6 py-3 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestRestricted;
