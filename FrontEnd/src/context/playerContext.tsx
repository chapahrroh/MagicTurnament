import { createContext, useContext, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AhuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AhuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const saveUser = localStorage.getItem("user");
    return saveUser ? JSON.parse(saveUser) : null;
  });

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken); // Store token in local storage
    localStorage.setItem("user", JSON.stringify(userData)); // Store user in local storage
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token"); // Remove token from local storage
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
