import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import CurrencySelector from "../CurrencySelector";
import NotificationCenter from "../NotificationCenter";
import HelpPanel from "./HelpPanel";
import UserDropdown from "./UserDropdown";
import LogoutModal from "../ui/LogoutModal";
import { clearAuthStorage } from "../../utils/authStorage";
import {
  Bell,
  LogOut,
  ChevronDown,
  HelpCircle,
  Moon,
  WalletCards
} from "lucide-react";

const Topbar = ({ auth }) => {
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();
  const { user: currentUser } = useUser();
  // Prioritize auth.user (immediate) over UserContext (async)
  const user = auth?.user || currentUser;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount({
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setShowHelp(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowUserDropdown(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    clearAuthStorage();
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleDarkMode = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const iconButtonClass =
    "relative rounded-lg p-2 text-[rgba(255,255,255,0.7)] transition-colors duration-200 ease-out hover:bg-[rgba(255,255,255,0.1)] hover:text-white";

  const smallIconClass = "h-[18px] w-[18px] stroke-[1.5]";

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full h-[80px] border-b border-[rgba(255,255,255,0.08)] text-white shadow-xl"
      style={{
        background: 'linear-gradient(90deg, #172554 0%, #0c1a3a 35%, #08111f 65%, #02050b 100%)',
      }}
    >
      <div className="px-3 py-3 md:px-4 md:py-4 lg:px-5">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#172554] text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.10)]">
              <WalletCards className="h-[18px] w-[18px] stroke-[1.75]" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                Welcome back, {user?.name?.split(" ")[0] || "Guest"}
              </h2>
              <p className="text-xs text-[rgba(255,255,255,0.6)]">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setShowNotifications(true);
              }}
              className={iconButtonClass}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className={smallIconClass} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setShowHelp(true);
              }}
              className={iconButtonClass}
              title="Help & Support (?)"
              aria-label="Open help and support"
            >
              <HelpCircle className={smallIconClass} />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`${iconButtonClass} ${!isDark ? "bg-[rgba(255,255,255,0.1)] text-[#60A5FA]" : ""}`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Moon className={smallIconClass} />
            </button>

            <div className="rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] text-white">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            <div className="h-7 w-px bg-[rgba(255,255,255,0.2)]"></div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown((prev) => !prev);
                }}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 ease-out hover:bg-[rgba(255,255,255,0.1)]"
              >
                {user && (
                  <div className="hidden text-right md:block">
                    <p className="max-w-[150px] truncate text-sm font-medium text-white">{user.name}</p>
                  </div>
                )}

                <div className="h-8 w-8 overflow-hidden rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)]">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "G"}
                    </div>
                  )}
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-[rgba(255,255,255,0.6)] transition-transform duration-200 ease-out ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showUserDropdown && (
                <UserDropdown
                  isOpen={showUserDropdown}
                  onClose={() => setShowUserDropdown(false)}
                  user={user}
                  onLogout={handleLogout}
                />
              )}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-red-400 transition-colors duration-200 ease-out hover:bg-[rgba(239,68,68,0.1)] hover:text-red-300"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className={smallIconClass} />
            </button>
          </div>
        </div>
      </div>

      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <LogoutModal isOpen={showLogoutModal} onClose={cancelLogout} onConfirm={confirmLogout} />
    </header>
  );
};

export default Topbar;
