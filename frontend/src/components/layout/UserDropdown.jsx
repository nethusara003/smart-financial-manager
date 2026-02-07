import { useNavigate } from 'react-router-dom';
import { User, Settings, FileText, HelpCircle, LogOut, Shield, Bell, CreditCard, Key } from 'lucide-react';

const UserDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Manage your personal information',
          action: () => {
            navigate('/settings?tab=profile');
            onClose();
          }
        },
        {
          icon: Settings,
          label: 'Account Settings',
          description: 'Preferences and configuration',
          action: () => {
            navigate('/settings?tab=preferences');
            onClose();
          }
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage notifications',
          action: () => {
            navigate('/settings?tab=notifications');
            onClose();
          }
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy & Security',
          description: 'Control your privacy settings',
          action: () => {
            navigate('/settings?tab=privacy');
            onClose();
          }
        },
        {
          icon: Key,
          label: 'Change Password',
          description: 'Update your password',
          action: () => {
            navigate('/settings?tab=password');
            onClose();
          }
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        {
          icon: FileText,
          label: 'Reports',
          description: 'View your financial reports',
          action: () => {
            navigate('/reports');
            onClose();
          }
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help and support',
          action: () => {
            onClose();
            // Help panel would be opened by parent
          }
        }
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      ></div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
        {/* User Info Header */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-0.5">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    {user?.name?.charAt(0).toUpperCase() || "G"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.name || "Guest User"}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user?.email || "guest@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="max-h-96 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="py-2">
              <div className="px-4 py-2">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h5>
              </div>
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 rounded-lg transition-colors">
                        <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {sectionIndex < menuSections.length - 1 && (
                <div className="mx-4 my-2 border-t border-gray-100"></div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full px-4 py-3 bg-danger-50 dark:bg-danger-900/20 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded-xl transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-100 dark:bg-danger-900/40 group-hover:bg-danger-200 dark:group-hover:bg-danger-900/60 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-danger-600 dark:text-danger-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-danger-600 dark:text-danger-400">
                  Sign Out
                </div>
                <div className="text-xs text-danger-500 dark:text-danger-500">
                  Log out of your account
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDropdown;
