import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { User, Settings, FileText, HelpCircle, LogOut, Shield, Bell, Key, ChevronRight } from 'lucide-react';

const UserDropdown = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const displayUser = currentUser || user;

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
      <div className="absolute right-0 top-full mt-3 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-glow-gold/20 border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in backdrop-blur-xl">
        {/* Premium Header with Avatar */}
        <div className="relative p-6 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 dark:from-gold-500 dark:via-gold-600 dark:to-yellow-600 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          
          <div className="relative flex items-center gap-4">
            {/* Premium Avatar */}
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md group-hover/avatar:blur-lg transition-all"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm p-0.5 border border-white/30">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {displayUser?.profilePicture ? (
                    <img src={displayUser.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 dark:from-gold-400 dark:to-gold-600 bg-clip-text text-transparent">
                      {displayUser?.name?.charAt(0).toUpperCase() || "G"}
                    </span>
                  )}
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white dark:border-gray-900 rounded-full shadow-lg"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg text-white truncate drop-shadow-sm">
                {displayUser?.name || "Guest User"}
              </h4>
              <p className="text-sm text-white/90 truncate drop-shadow-sm">
                {displayUser?.email || "guest@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="max-h-[420px] overflow-y-auto py-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="px-3 py-2">
              <div className="px-3 py-2">
                <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h5>
              </div>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className="w-full px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-gold-900/20 dark:hover:to-gold-800/20 transition-all text-left group border border-transparent hover:border-purple-200 dark:hover:border-gold-500/30 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon container with better spacing */}
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 group-hover:from-purple-100 group-hover:to-purple-200 dark:group-hover:from-gold-900/40 dark:group-hover:to-gold-800/40 rounded-xl transition-all shadow-sm">
                          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-gold-400 transition-colors" />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-gold-300 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-purple-600 dark:group-hover:text-gold-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Divider */}
              {sectionIndex < menuSections.length - 1 && (
                <div className="my-3 mx-3 border-t border-gray-200 dark:border-gray-700"></div>
              )}
            </div>
          ))}
        </div>

        {/* Premium Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 rounded-xl transition-all text-left group border border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700/50 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 group-hover:from-red-200 group-hover:to-red-300 dark:group-hover:from-red-900/60 dark:group-hover:to-red-800/60 rounded-xl transition-all shadow-sm">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-red-700 dark:text-red-400">
                  Sign Out
                </div>
                <div className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  Log out of your account
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDropdown;
