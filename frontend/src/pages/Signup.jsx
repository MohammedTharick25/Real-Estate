import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      alert("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create Account
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Join our community to find your perfect home.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button className="w-full bg-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition-all shadow-lg bg-blue-950">
              Sign Up
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-bold">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
