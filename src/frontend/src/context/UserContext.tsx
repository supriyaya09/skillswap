import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "../backend.d.ts";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  logout: () => {},
  isAdmin: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("skillswap_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem("skillswap_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("skillswap_user");
    }
  };

  const logout = () => setCurrentUser(null);

  const isAdmin = currentUser?.role === "admin";

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, logout, isAdmin }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
