"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    const token = Cookies.get("token");
    console.log("AuthContext: refreshUser called. Token:", token ? "Present" : "Missing");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      console.log("AuthContext: getCurrentUser response:", response);
      if (response.user) {
        setUser(response.user);
      } else {
        // Only logout if we strictly expect a user but didn't get one, 
        // though usually 401 would be caught by catch block or interceptor.
        // If response is 200 but no user, it's weird, but let's not aggressively logout unless sure.
        console.warn("No user found in response:", response);
        // logout(); // potentially dangerous if API format changes
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 7 }); // Expires in 7 days
    setUser(userData);

    // Redirect based on role
    switch (userData.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'styler':
        router.push('/styler');
        break;
      case 'partner':
        router.push('/partner');
        break;
      default:
        router.push('/');
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
