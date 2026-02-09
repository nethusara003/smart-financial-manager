import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { useUser } from "../context/UserContext";
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Globe, 
  Palette, 
  Download,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Lock,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currentCurrency, changeCurrency } = useCurrency();
  const { updateUser } = useUser();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Debug: Log theme changes
  useEffect(() => {
    console.log('Current theme:', theme);
    console.log('HTML classList:', document.documentElement.classList.toString());
  }, [theme]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: "",
    bio: "",
    profilePicture: ""
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    budgetAlerts: true,
    billReminders: true,
    weeklyReports: true,
    transactionAlerts: true,
    goalUpdates: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginNotifications: true,
    dataSharing: false
  });
  const [savedMessage, setSavedMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Fetch user profile from backend
          const response = await fetch("http://localhost:5000/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            // Update profile data
            setProfileData({
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              bio: user.bio || "",
              profilePicture: user.profilePicture || ""
            });
            
            // Extract country code from phone if it exists
            if (user.phone) {
              const match = user.phone.match(/^(\+\d{1,4})/);
              if (match) {
                setCountryCode(match[1]);
                setProfileData(prev => ({
                  ...prev,
                  phone: user.phone.replace(match[1], "").trim()
                }));
              }
            }
            
            // Update notification settings
            if (user.notificationSettings) {
              setNotificationSettings(user.notificationSettings);
            }
            
            // Update privacy settings
            if (user.privacySettings) {
              setPrivacySettings(user.privacySettings);
            }
          }
        }
        
        // Fallback to localStorage if backend fetch fails
        const savedNotifications = localStorage.getItem("notificationSettings");
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications));
        }
        
        const savedPrivacy = localStorage.getItem("privacySettings");
        if (savedPrivacy) {
          setPrivacySettings(JSON.parse(savedPrivacy));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "password", label: "Change Password", icon: Key },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "data", label: "Data & Storage", icon: Download }
  ];

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Combine country code with phone number
      const fullPhone = profileData.phone ? `${countryCode} ${profileData.phone}` : "";
      
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          phone: fullPhone
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        
        // Update UserContext to reflect changes immediately in topbar
        updateUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          bio: data.user.bio,
          profilePicture: data.user.profilePicture
        });
        
        showSavedMessage("Profile updated successfully!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      alert("Error updating profile");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationSettings })
      });

      if (response.ok) {
        localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
        showSavedMessage("Notification preferences saved!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to save notification settings");
      }
    } catch (error) {
      alert("Error saving notification settings");
    }
  };

  const handleSavePrivacy = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/privacy-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ privacySettings })
      });

      if (response.ok) {
        localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
        showSavedMessage("Privacy settings updated!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to save privacy settings");
      }
    } catch (error) {
      alert("Error saving privacy settings");
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showSavedMessage(`Theme changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode!`);
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      // Update local state
      changeCurrency(newCurrency);
      
      // Update in backend
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/users/update-currency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currency: newCurrency })
      });
      
      showSavedMessage(`Currency changed to ${CURRENCIES[newCurrency].name}!`);
    } catch (error) {
      console.error("Error updating currency:", error);
      showSavedMessage("Failed to update currency");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showSavedMessage("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await response.json();
        alert(data.message || "Failed to change password");
      }
    } catch (error) {
      alert("Error changing password");
    }
  };

  const showSavedMessage = (message) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleChangeAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          
          // Update profile with new avatar immediately
          try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/users/profile", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                profilePicture: base64Image
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              // Update UserContext to show avatar immediately in topbar
              updateUser({
                profilePicture: base64Image
              });
              setProfileData(prev => ({ ...prev, profilePicture: base64Image }));
              showSavedMessage('Avatar updated successfully!');
            } else {
              const errorData = await response.json();
              alert(errorData.message || 'Failed to update avatar');
            }
          } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Error updating avatar: ' + error.message);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSavePreferences = () => {
    // Theme and currency are already saved via their individual handlers
    showSavedMessage("Preferences saved successfully!");
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/export-data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const dataStr = JSON.stringify(data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        showSavedMessage("Data exported successfully!");
      } else {
        alert("Failed to export data");
      }
    } catch (error) {
      alert("Error exporting data");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      const password = window.prompt("Enter your password to confirm account deletion:");
      if (!password) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users/delete-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password })
        });

        if (response.ok) {
          alert("Account deleted successfully. You will be logged out.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          const data = await response.json();
          alert(data.message || "Failed to delete account");
        }
      } catch (error) {
        alert("Error deleting account");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-surface-elevated dark:via-dark-surface-primary dark:to-dark-bg-primary rounded-2xl p-8 shadow-xl dark:shadow-glow-blue border border-transparent dark:border-dark-border-strong">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-blue-500/5 dark:to-transparent"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 dark:bg-blue-500/10 backdrop-blur-sm p-2 rounded-xl border border-white/30 dark:border-blue-500/20">
              <Shield className="w-6 h-6 text-white dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white dark:text-blue-300">Settings</h1>
          </div>
          <p className="text-white/90 dark:text-blue-200/60">Manage your account preferences and security</p>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="fixed top-4 right-4 z-50 bg-success-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-down">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{savedMessage}</span>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card border border-gray-200 dark:border-gray-700 sticky top-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-md dark:shadow-glow-blue"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card border border-gray-200 dark:border-gray-700">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Update your personal details and contact information</p>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-0.5 shadow-lg dark:shadow-glow-blue">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                        {profileData.profilePicture ? (
                          <img src={profileData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                            {profileData.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={handleChangeAvatar}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
                    >
                      Change Avatar
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF, max 5MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-32">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+7">🇷🇺 +7</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+27">🇿🇦 +27</option>
                        </select>
                      </div>
                      <div className="relative flex-1">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          placeholder="555 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-400">Choose how you want to be notified</p>
                </div>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Budget Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Budget Alerts</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when approaching budget limits</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.budgetAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, budgetAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Bill Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-danger-600 mt-0.5" />
                      <div>
                       <h4 className="font-semibold text-gray-900 dark:text-gray-100">Bill Reminders</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reminders for upcoming bill payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.billReminders}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, billReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Weekly Reports */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-secondary-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Reports</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly financial summaries</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Transaction Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Transaction Alerts</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for new transactions</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.transactionAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, transactionAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveNotifications}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg dark:shadow-glow-blue transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
                  <p className="text-gray-600 dark:text-gray-400">Control your account security and privacy settings</p>
                </div>

                {/* Security Status */}
                <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-success-500 rounded-xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-success-900 mb-1">Your Account is Secure</h3>
                      <p className="text-sm text-success-700">All security features are enabled and working properly</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.twoFactorAuth}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, twoFactorAuth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Login Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-warning-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Login Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new login attempts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.loginNotifications}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, loginNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Session Timeout */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3 mb-3">
                      <Globe className="w-5 h-5 text-secondary-600 dark:text-secondary-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Session Timeout</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Auto-logout after period of inactivity</p>
                        <select
                          value={privacySettings.sessionTimeout}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, sessionTimeout: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" value="15">15 minutes</option>
                          <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" value="30">30 minutes</option>
                          <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" value="60">1 hour</option>
                          <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" value="120">2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Data Sharing */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-info-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Analytics & Data Sharing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Share anonymous usage data to improve the app</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.dataSharing}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, dataSharing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSavePrivacy}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg dark:shadow-glow-blue transition-all"
                  >
                    Save Security Settings
                  </button>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Password Requirements
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1 ml-7">
                    <li>• At least 8 characters long</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg dark:shadow-glow-blue transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">App Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customize your app experience</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">English</option>
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">Spanish</option>
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">French</option>
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">German</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => handleThemeChange('light')}
                          className={`p-4 border-2 ${
                            theme === 'light' 
                              ? 'border-primary-500 dark:border-primary-400 shadow-lg' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          } bg-white dark:bg-gray-700 rounded-xl text-center transition-all`}
                        >
                          <div className="w-full h-12 bg-gradient-to-br from-white to-gray-100 border border-gray-300 rounded-lg mb-2"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</span>
                          {theme === 'light' && <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">✓ Active</div>}
                        </button>
                        <button 
                          onClick={() => handleThemeChange('dark')}
                          className={`p-4 border-2 ${
                            theme === 'dark' 
                              ? 'border-primary-500 dark:border-primary-400 shadow-lg' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          } bg-white dark:bg-gray-700 rounded-xl text-center transition-all`}
                        >
                          <div className="w-full h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-2"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</span>
                          {theme === 'dark' && <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">✓ Active</div>}
                        </button>
                        <button 
                          onClick={() => handleThemeChange('auto')}
                          className={`p-4 border-2 ${
                            theme === 'auto' 
                              ? 'border-primary-500 dark:border-primary-400 shadow-lg' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          } bg-white dark:bg-gray-700 rounded-xl text-center transition-all`}
                        >
                          <div className="w-full h-12 bg-gradient-to-r from-white via-gray-500 to-gray-900 rounded-lg mb-2"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto</span>
                          {theme === 'auto' && <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">✓ Active</div>}
                        </button>
                      </div>
                    </div>

                    {/* Date Format */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">MM/DD/YYYY</option>
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">DD/MM/YYYY</option>
                        <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">YYYY-MM-DD</option>
                      </select>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select 
                        value={currentCurrency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {Object.values(CURRENCIES).map((currency) => (
                          <option 
                            key={currency.code} 
                            value={currency.code}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {currency.flag} {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        This will affect how amounts are displayed throughout the app, including the chatbot
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleSavePreferences}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg dark:shadow-glow-blue transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Data & Storage Tab */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Data & Storage</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your data and account</p>
                </div>

                {/* Export Data */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-1">Export Your Data</h3>
                      <p className="text-sm text-blue-700 mb-4">Download all your financial data in CSV format</p>
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Download Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="p-6 bg-gradient-to-br from-danger-50 to-danger-100 border border-danger-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-danger-500 rounded-xl">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-danger-900 mb-1">Delete Account</h3>
                      <p className="text-sm text-danger-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors font-medium"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
