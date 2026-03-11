import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { t } from "@lingui/macro";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      login(res.data);
      navigate("/");
    } catch (err) {
      alert(t`Invalid Credentials`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black transition-colors flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl border border-blue-100 dark:border-slate-800 transition-colors">
          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t`Welcome Back`}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {t`Sign in to manage your properties`}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold ml-1 text-slate-700 dark:text-slate-300">
                {t`Email`}
              </label>

              <input
                type="email"
                placeholder={t`example@gmail.com`}
                required
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold ml-1 text-slate-700 dark:text-slate-300">
                {t`Password`}
              </label>

              <input
                type="password"
                placeholder={t`pass123`}
                required
                className="w-full p-4 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-blue-400/30 text-slate-900 dark:text-white placeholder:text-slate-400"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95">
              {t`Login`}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            {t`New here?`}{" "}
            <Link
              to="/signup"
              className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              {t`Create Account`}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
