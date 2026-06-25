import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Sync token and load user profile on boot
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get("/api/auth/profile");
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          logout();
        }
      }
      setLoading(false);
      // Automatically transition browser tab title after app initialization
      setTimeout(() => {
        document.title = "FlashMind AI - Smart Flashcard Generator";
      }, 1200);
    };

    initAuth();
  }, [token]);

  // Login handler: FastAPI OAuth2PasswordRequestForm requires form-url-encoded fields
  const login = async (email, password) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/api/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = res.data.access_token;
      localStorage.setItem("token", accessToken);
      setToken(accessToken);
      
      // Load user profile
      const profileRes = await api.get("/api/auth/profile");
      setUser(profileRes.data);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error("[AUTH CONTEXT] Login API error response:", err.response?.data || err.message);
      const detail = err.response?.data?.detail || "Invalid credentials. Please try again.";
      return { success: false, error: detail };
    }
  };

  // Register handler
  const register = async (fullName, email, password) => {
    setLoading(true);
    console.log(`[AUTH CONTEXT] Registering user: ${email}`);
    try {
      await api.post("/api/auth/register", {
        full_name: fullName,
        email,
        password,
      });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error("[AUTH CONTEXT] Registration API error response:", err.response?.data || err.message);
      const detail = err.response?.data?.detail || "Registration failed. Try a different email.";
      return { success: false, error: detail };
    }
  };

  // Logout handler
  const logout = (explicit = false) => {
    localStorage.removeItem("token");
    if (explicit) {
      sessionStorage.setItem("explicitLogout", "true");
    }
    setToken(null);
    setUser(null);
  };

  // Profile update handler
  const updateProfile = async (updates) => {
    try {
      const res = await api.put("/api/profile", updates);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to update profile information.";
      return { success: false, error: detail };
    }
  };

  // Delete account handler
  const deleteAccount = async () => {
    try {
      await api.delete("/api/profile");
      logout();
      return { success: true };
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to delete account.";
      return { success: false, error: detail };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
