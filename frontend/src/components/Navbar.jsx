import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  List,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function Navbar() {
  // Ensure the component re-renders when language changes
  useLingui();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Links defined inside to catch translation updates
  const navLinks = [
    { name: t`Home`, path: "/", icon: <Home size={20} /> },
    { name: t`Browse Properties`, path: "/listings", icon: <List size={20} /> },
    { name: t`Call Us`, path: "/contact", icon: <Phone size={20} /> },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-2xl font-black text-blue-600 tracking-tight flex items-center"
        >
          Estat<span className="text-slate-900 dark:text-white">era</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors hover:text-blue-600 ${
                location.pathname === link.path
                  ? "text-blue-600"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {user ? (
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-600 transition"
            >
              <img
                src={
                  user?.user?.image ||
                  `https://ui-avatars.com/api/?name=${user?.user?.name || "User"}`
                }
                alt={t`Full Name`}
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:block bg-slate-900 dark:bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm shadow transition"
            >
              {t`Login`}
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-900 dark:text-white"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <span className="text-xl font-bold text-blue-600">
                  {t`Manage All`}
                </span>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 px-4 py-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-4 rounded-xl font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-4 p-4 rounded-xl text-slate-900 dark:text-white"
                    >
                      <User size={20} />
                      {t`Edit Profile`}
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="flex items-center gap-4 p-4 text-red-500 font-semibold"
                    >
                      <LogOut size={20} />
                      {t`Sign Out`}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex justify-center p-4 bg-slate-900 text-white rounded-xl mt-4"
                  >
                    {t`Login`}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
