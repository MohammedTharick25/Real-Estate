import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Shield,
  User as UserIcon,
  ArrowRight,
  Camera,
  Edit3,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.user?.name || "",
    email: user?.user?.email || "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const defaultImg = `https://ui-avatars.com/api/?name=${user.user.name}&background=2563eb&color=fff&size=200`;
  const currentAvatar = previewImage || user?.user?.image || defaultImg;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const userId = user?.user?.id || user?.user?._id;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("id", userId);

    if (selectedFile) data.append("image", selectedFile);

    setLoading(true);

    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/update",
        data,
      );

      login(res.data);
      setIsEditing(false);
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-16 bg-white dark:bg-slate-900"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-black/40 overflow-hidden border border-slate-100 dark:border-slate-800">
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />

          <div className="px-8 pb-12 relative">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="relative group w-fit">
                <img
                  src={currentAvatar}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                />

                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white"
                  >
                    <Camera />
                  </button>
                )}

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* User Info */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                        {user.user.name}
                      </h1>

                      <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-1 lowercase">
                        <Mail size={16} /> {user.user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <UserIcon size={18} /> Information
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">
                            Full Name
                          </span>

                          <span className="font-black text-slate-900 dark:text-white">
                            {user.user.name}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">
                            Email
                          </span>

                          <span className="font-black text-slate-900 dark:text-white">
                            {user.user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={18} /> Permissions
                      </h3>

                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        You currently have{" "}
                        <span className="font-black text-slate-900 dark:text-white">
                          {user.user.role}
                        </span>{" "}
                        access level.
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    {user.user.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        Manage Dashboard <ArrowRight size={20} />
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="flex-1 border-2 border-red-200 text-red-500 py-4 rounded-2xl font-black text-lg hover:bg-red-50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  onSubmit={handleSave}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Edit Profile
                    </h2>

                    <button type="button" onClick={() => setIsEditing(false)}>
                      <X />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200"
                  />

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Check />}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
