/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { fetchCurrentUserProfile } from "../hooks/useAuth";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: "",
    bio: "",
    profilePicture: ""
  });

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
    
    // Update localStorage
    if (userData.name) localStorage.setItem("userName", userData.name);
    if (userData.email) localStorage.setItem("userEmail", userData.email);
  }, []);

  // Load user data from backend
  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUserProfile();
      if (currentUser) {
        updateUser(currentUser);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [updateUser]);

  // Load on mount and sync with storage changes
  useEffect(() => {
    // First, check if user data was just stored in localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    
    if (storedName && !user.name) {
      setUser(prev => ({
        ...prev,
        name: storedName,
        email: storedEmail || prev.email
      }));
    }
    
    // Then fetch fresh data from backend
    queueMicrotask(() => {
      void loadUserData();
    });
  }, [loadUserData]);
  
  // Listen for storage changes from other tabs and user data updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userName" && e.newValue) {
        setUser(prev => ({ ...prev, name: e.newValue }));
      }
      if (e.key === "userEmail" && e.newValue) {
        setUser(prev => ({ ...prev, email: e.newValue }));
      }
    };
    
    const handleUserDataUpdated = (e) => {
      if (e.detail) {
        updateUser(e.detail);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-data-updated", handleUserDataUpdated);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-data-updated", handleUserDataUpdated);
    };
  }, [updateUser]);

  const value = {
    user,
    updateUser,
    refreshUser: loadUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
