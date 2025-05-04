import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { config } from "../config";

// Define user types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "client";
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface DecodedToken {
  userId: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credentialResponse: any) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiBaseUrl,
});

// Add interceptor to handle token refresh
api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    try {
      // Check if token is expired
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token is expired, try to refresh
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await axios.post(
              // @ts-ignore
              `${config.apiBaseUrl}/user/refresh-token`,
              { refreshToken }
            );

            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data;

            // Update tokens in localStorage
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Update header with new token
            config.headers.Authorization = `Bearer ${newAccessToken}`;
          } catch (error) {
            // Refresh failed, clear tokens and user
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }
      } else {
        // Token is still valid
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Token validation error", error);
    }
  }

  return config;
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for saved login on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (savedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Validate token
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired, try refresh
            await refreshTokens();
          }
        } catch (error) {
          console.error("Failed to restore authentication state", error);
          // Clear invalid state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const refreshTokens = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/user/refresh-token`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return true;
    } catch (error) {
      console.error("Token refresh failed", error);
      // Clear authentication state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}/user/signin`, {
        username: email,
        password: password,
      });

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user info
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
    } catch (error) {
      let errorMessage = "Invalid email or password";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        throw new Error("Google credential missing");
      }

      const decoded = jwtDecode<GoogleUser>(credential);

      const user: User = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: "client",
      };

      localStorage.setItem("accessToken", credential);
      localStorage.setItem("token", credential); 
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error(error);
      throw new Error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/user/admin-login`,
        {
          username: email,
          password: password,
        }
      );

      const { admin, accessToken, refreshToken } = response.data;

      // Store tokens and admin info
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(admin));

      setUser(admin);
    } catch (error) {
      let errorMessage = "Invalid admin credentials";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        // Try server-side logout
        try {
          await axios.post(
            `${config.apiBaseUrl}/user/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (error) {
          console.error("Server logout failed", error);
        }
      }
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const getToken = async (): Promise<string | null> => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        // Validate token
        const decoded = jwtDecode<DecodedToken>(accessToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired, try refresh
          const refreshed = await refreshTokens();
          if (refreshed) {
            return localStorage.getItem("accessToken");
          }
          return null;
        }

        return accessToken;
      } catch (error) {
        console.error("Token validation failed", error);
        return null;
      }
    }

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        googleLogin,
        adminLogin,
        logout,
        isAdmin,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
