import { createContext, useState, useContext, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial boot
  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  /**
   * Updates the favorites array inside the user object
   * and syncs it with localStorage so it persists on refresh.
   */
  const updateWishlist = (newFavorites) => {
    setUser((prev) => {
      if (!prev) return null;

      const updatedUser = {
        ...prev,
        user: {
          ...prev.user,
          favorites: newFavorites,
        },
      };

      // Update local storage so it persists on refresh
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  // Show a spinner while checking localStorage
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, updateWishlist }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
