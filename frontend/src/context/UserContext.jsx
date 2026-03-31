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

  // Load on mount
  useEffect(() => {
    queueMicrotask(() => {
      void loadUserData();
    });
  }, [loadUserData]);

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
