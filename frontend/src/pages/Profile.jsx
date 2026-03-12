import { useState, useRef, useEffect } from "react";
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
  Star,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function Profile() {
  const { i18n } = useLingui();
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myVisits, setMyVisits] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "" });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.user?.name || "",
    email: user?.user?.email || "",
    language: user?.user?.language || "en",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user?.user?.id) fetchMyVisits();
  }, [user]);

  const fetchMyVisits = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/visits/user/${user.user.id}`,
      );
      setMyVisits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (visitId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/visits/${visitId}/feedback`,
        feedbackData,
      );
      alert(t`Message sent successfully!`);
      fetchMyVisits();
    } catch (err) {
      alert(t`Failed to send message`);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const defaultImg = `https://ui-avatars.com/api/?name=${user.user.name}&background=2563eb&color=fff&size=200`;
  const currentAvatar = previewImage || user?.user?.image || defaultImg;

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setFormData((prev) => ({ ...prev, language: lang }));
    i18n.activate(lang);
    localStorage.setItem("lang", lang);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("language", formData.language);
    data.append("id", user.user.id);
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
      alert(t`Profile update failed`);
    } finally {
      setLoading(false);
    }
  };

  // Helper for Status Colors
  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "scheduled":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "visited":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-16"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-black/40 overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="px-8 pb-12 relative">
            <div className="relative -mt-16 mb-6 flex justify-center">
              <div className="relative group w-fit">
                <img
                  src={currentAvatar}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                  alt="Avatar"
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
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                    setPreviewImage(URL.createObjectURL(e.target.files[0]));
                  }}
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
                      <Edit3 size={16} /> {t`Edit Profile`}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <UserIcon size={18} /> {t`Edit Profile`}
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">{t`Full Name`}</span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {user.user.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">{t`Email`}</span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {user.user.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">{t`Preferred Language`}</span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {formData.language === "hi"
                              ? t`Hindi`
                              : formData.language === "ta"
                                ? t`Tamil`
                                : t`English`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={18} /> {t`Permissions`}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {t`Current Role`}{" "}
                        <span className="font-black text-slate-900 dark:text-white">
                          {user.user.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Visit History Section */}
                  <div className="mt-12">
                    <h3 className="text-2xl font-black mb-6 dark:text-white flex items-center gap-2">
                      <MessageSquare /> {t`Schedule a Visit`}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {myVisits.map((v) => (
                        <div
                          key={v._id}
                          className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold dark:text-white">
                                {v.propertyId?.title}
                              </p>
                              <p className="text-xs text-slate-400">
                                {v.propertyId?.location}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${getStatusStyles(v.status)}`}
                            >
                              {t`${v.status}`}
                            </span>
                          </div>

                          {v.status === "visited" && !v.feedback?.rating && (
                            <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-blue-200 dark:border-slate-700">
                              <p className="text-sm font-bold mb-3 dark:text-white">{t`Rate your experience`}</p>
                              <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <Star
                                    key={num}
                                    size={20}
                                    className="cursor-pointer"
                                    fill={
                                      feedbackData.rating >= num
                                        ? "gold"
                                        : "none"
                                    }
                                    color={
                                      feedbackData.rating >= num
                                        ? "gold"
                                        : "gray"
                                    }
                                    onClick={() =>
                                      setFeedbackData({
                                        ...feedbackData,
                                        rating: num,
                                      })
                                    }
                                  />
                                ))}
                              </div>
                              <textarea
                                placeholder={t`Your Message...`}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 text-sm outline-none dark:text-white"
                                onChange={(e) =>
                                  setFeedbackData({
                                    ...feedbackData,
                                    comment: e.target.value,
                                  })
                                }
                              />
                              <button
                                onClick={() => submitFeedback(v._id)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm"
                              >{t`Save Changes`}</button>
                            </div>
                          )}
                          {v.feedback?.rating && (
                            <div className="mt-2 text-sm text-slate-500 italic">
                              "{v.feedback.comment}" - {v.feedback.rating}/5 ⭐
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    {user.user.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        {t`Manage Dashboard`} <ArrowRight size={20} />
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="flex-1 border-2 border-red-200 text-red-500 py-4 rounded-2xl font-black text-lg hover:bg-red-50"
                    >{t`Sign Out`}</button>
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
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t`Edit Profile`}</h2>
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
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white outline-none"
                    placeholder={t`Full Name`}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white outline-none"
                    placeholder={t`Email`}
                  />
                  <div>
                    <label className="block mb-2 font-bold dark:text-white">{t`Preferred Language`}</label>
                    <select
                      value={formData.language}
                      onChange={handleLanguageChange}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white outline-none"
                    >
                      <option value="en">{t`English`}</option>
                      <option value="hi">{t`Hindi`}</option>
                      <option value="ta">{t`Tamil`}</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Check />}{" "}
                    {loading ? t`Saving...` : t`Save Changes`}
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
