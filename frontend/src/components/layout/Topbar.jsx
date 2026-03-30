import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import CurrencySelector from "../CurrencySelector";
import SearchModal from "./SearchModal";
import NotificationCenter from "../NotificationCenter";
import HelpPanel from "./HelpPanel";
import UserDropdown from "./UserDropdown";
import LogoutModal from "../ui/LogoutModal";
import {
  Bell,
  LogOut,
  ChevronDown,
  Search,
  HelpCircle,
  WalletCards
} from "lucide-react";

const Topbar = ({ auth }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const user = currentUser || auth?.user;

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let shouldPoll = true;

    const loadData = async () => {
      if (!shouldPoll) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token || token === "null" || token === "undefined") {
          shouldPoll = false;
          if (isMounted) {
            setTransactions([]);
            setUnreadCount(0);
          }
          return;
        }

        const txResponse = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (txResponse.status === 401) {
          shouldPoll = false;
          if (isMounted) {
            setTransactions([]);
            setUnreadCount(0);
          }
          return;
        }

        if (txResponse.ok && isMounted) {
          const data = await txResponse.json();
          setTransactions(data);
        }

        const notifResponse = await fetch("http://localhost:5000/api/notifications?unreadOnly=true", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (notifResponse.status === 401) {
          shouldPoll = false;
          if (isMounted) {
            setUnreadCount(0);
          }
          return;
        }

        if (notifResponse.ok && isMounted) {
          const notifData = await notifResponse.json();
          setUnreadCount(notifData.unreadCount || 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
        }
      }
    };

    loadData();

    const interval = setInterval(() => {
      if (shouldPoll) {
        loadData();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }

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
    localStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const iconButtonClass =
    "relative rounded-lg p-2 text-gray-600 transition-colors duration-200 ease-out hover:bg-gray-100 hover:text-blue-600 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover dark:hover:text-dark-accent-blue";

  const smallIconClass = "h-[18px] w-[18px] stroke-[1.75]";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/90 bg-white/90 backdrop-blur-md dark:border-dark-border-strong dark:bg-dark-bg-primary/90">
      <div className="px-3 py-2.5 md:px-4 md:py-3 lg:px-5">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-blue-700 dark:bg-dark-surface-secondary dark:text-dark-accent-blue">
              <WalletCards className="h-[18px] w-[18px] stroke-[1.75]" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-dark-text-primary sm:text-base">
                Welcome back, {user?.name?.split(" ")[0] || "Guest"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
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
                setShowSearch(true);
              }}
              className={iconButtonClass}
              title="Search transactions (Ctrl+K)"
              aria-label="Search transactions"
            >
              <Search className={smallIconClass} />
            </button>

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

            <div className="rounded-lg border border-gray-200 bg-white px-1 dark:border-dark-border-strong dark:bg-dark-surface-secondary">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            <div className="h-7 w-px bg-gray-200 dark:bg-dark-border-strong"></div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown((prev) => !prev);
                }}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 ease-out hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
              >
                {user && (
                  <div className="hidden text-right md:block">
                    <p className="max-w-[150px] truncate text-sm font-medium text-gray-800 dark:text-dark-text-primary">{user.name}</p>
                  </div>
                )}

                <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-300 bg-gray-100 dark:border-dark-border-strong dark:bg-dark-surface-secondary">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">
                      {user?.name?.charAt(0).toUpperCase() || "G"}
                    </div>
                  )}
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ease-out dark:text-dark-text-tertiary ${
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
              className="rounded-lg p-2 text-red-600 transition-colors duration-200 ease-out hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className={smallIconClass} />
            </button>
          </div>
        </div>
      </div>

      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} transactions={transactions} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <LogoutModal isOpen={showLogoutModal} onClose={cancelLogout} onConfirm={confirmLogout} />
    </header>
  );
};

export default Topbar;
