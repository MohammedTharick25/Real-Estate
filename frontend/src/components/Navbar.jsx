import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
  Home,
  List,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  /* Apply theme */
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  /* Prevent background scroll */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
  }, [isMobileMenuOpen]);

  /* Close sidebar on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const profileImg =
    user?.user?.image ||
    `https://ui-avatars.com/api/?name=${user?.user?.name || "User"}&background=2563eb&color=fff`;

  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Properties", path: "/listings", icon: <List size={20} /> },
    { name: "Contact", path: "/contact", icon: <Phone size={20} /> },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const sidebarVariants = {
    closed: { x: "100%", transition: { duration: 0.25 } },
    opened: {
      x: 0,
      transition: { duration: 0.3, staggerChildren: 0.07, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    opened: { opacity: 1, x: 0 },
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black text-blue-600 tracking-tight flex items-center"
        >
          Estat<span className="text-slate-900 dark:text-white">era</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors hover:text-blue-600 ${
                isActive(link.path)
                  ? "text-blue-600"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            aria-label="Toggle Theme"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* Profile */}
          {user ? (
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-600 transition"
            >
              <img
                src={profileImg}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:block bg-slate-900 dark:bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm shadow hover:scale-105 transition"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            aria-label="Open Menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-900 dark:text-white"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="opened"
              exit="closed"
              className="fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <span className="text-xl font-bold text-blue-600">
                  Navigation
                </span>

                <button
                  aria-label="Close Menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 px-4 py-6 overflow-y-auto hide-scrollbar flex flex-col gap-2">
                {navLinks.map((link) => (
                  <motion.div key={link.path} variants={itemVariants}>
                    <Link
                      to={link.path}
                      className={`flex items-center justify-between p-4 rounded-xl font-semibold transition ${
                        isActive(link.path)
                          ? "bg-blue-600 text-white"
                          : "text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {link.icon}
                        {link.name}
                      </div>

                      <ChevronRight size={16} className="opacity-40" />
                    </Link>
                  </motion.div>
                ))}

                <hr className="my-4 border-slate-200 dark:border-slate-800" />

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User size={20} /> My Profile
                    </Link>

                    {user.user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-4 p-4 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                      >
                        <Shield size={20} /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex items-center gap-4 p-4 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex justify-center p-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-semibold mt-4"
                  >
                    Login to Account
                  </Link>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 uppercase tracking-widest">
                Estatera • Property Redefined
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
