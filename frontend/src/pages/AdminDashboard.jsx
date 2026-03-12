import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Menu,
  X,
  CheckCircle,
  Clock,
  LayoutGrid,
  Calendar,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@lingui/macro";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    size: "",
    propertyType: "Land",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchListings();
    fetchVisits();
  }, []);

  const fetchListings = async () => {
    const res = await axios.get("http://localhost:5000/api/listings");
    setListings(res.data);
  };

  const fetchVisits = async () => {
    const res = await axios.get("http://localhost:5000/api/visits/admin");
    setVisits(res.data);
  };

  const updateVisitStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/visits/${id}/status`, {
        status,
      });
      fetchVisits();
    } catch (err) {
      alert(t`Failed to update status: ${err.message}`);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Sold" : "Available";
    try {
      await axios.patch(`http://localhost:5000/api/listings/${id}/status`, {
        status: newStatus,
      });
      fetchListings();
    } catch (err) {
      alert(t`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t`Permanent Delete?`)) {
      await axios.delete(`http://localhost:5000/api/listings/${id}`);
      fetchListings();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Array.from(images).forEach((img) => data.append("images", img));
    Array.from(videos).forEach((v) => data.append("videos", v));

    try {
      await axios.post("http://localhost:5000/api/listings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t`Property Added!`);
      setActiveTab("manage");
      fetchListings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper for Status Colors (Matches Profile.jsx logic)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-600">{t`AdminPanel`}</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 ${sidebarOpen ? "block" : "hidden md:block"}`}
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-blue-600">{t`AdminPanel`}</h2>
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X />
              </button>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("add");
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full p-4 rounded-xl transition-all ${activeTab === "add" ? "bg-blue-600 shadow-lg" : "hover:bg-slate-800 text-slate-400"}`}
              >
                <Plus size={20} className="mr-3" /> {t`Add Listing`}
              </button>
              <button
                onClick={() => {
                  setActiveTab("manage");
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full p-4 rounded-xl transition-all ${activeTab === "manage" ? "bg-blue-600 shadow-lg" : "hover:bg-slate-800 text-slate-400"}`}
              >
                <LayoutGrid size={20} className="mr-3" /> {t`Manage All`}
              </button>
              <button
                onClick={() => {
                  setActiveTab("visits");
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full p-4 rounded-xl transition-all ${activeTab === "visits" ? "bg-blue-600 shadow-lg" : "hover:bg-slate-800 text-slate-400"}`}
              >
                <Calendar size={20} className="mr-3" /> {t`Schedule a Visit`}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 lg:p-16 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === "add" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">{t`New Property`}</h1>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Title`}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Price (₹)`}</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Size (sqft/acre)`}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Location`}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Type`}</label>
                  <select
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, propertyType: e.target.value })
                    }
                  >
                    <option value="Land">{t`Land`}</option>
                    <option value="House">{t`House`}</option>
                    <option value="Apartment">{t`Apartment`}</option>
                  </select>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-slate-800 p-6 rounded-3xl border border-dashed border-blue-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">{t`Images`}</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(e.target.files)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 dark:text-white">{t`Videos`}</label>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => setVideos(e.target.files)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t`Description`}</label>
                  <textarea
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl h-40 outline-none text-slate-900 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
                <button
                  disabled={isUploading}
                  className="md:col-span-2 w-full py-5 bg-blue-900 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all disabled:bg-slate-300"
                >
                  {isUploading ? t`Uploading...` : t`Publish Property`}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "manage" && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">{t`Manage Listings`}</h1>
              <div className="grid grid-cols-1 gap-4">
                {listings.map((item) => (
                  <motion.div
                    key={item._id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={item.images[0]}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {item.location}
                        </p>
                        <p className="text-blue-600 font-black mt-1">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => toggleStatus(item._id, item.status)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${item.status === "Sold" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                      >
                        {item.status === "Sold" ? (
                          <Clock size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}{" "}
                        {t`${item.status}`}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "visits" && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
                {t`Manage All`} (Visits)
              </h1>
              <div className="grid grid-cols-1 gap-4">
                {visits.map((v) => (
                  <div
                    key={v._id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {v.name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {v.propertyId?.title}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${getStatusStyles(v.status)}`}
                        >
                          {t`${v.status}`}
                        </span>
                      </div>
                      {v.feedback?.rating && (
                        <div className="flex items-center gap-1 mt-2 text-yellow-500">
                          <Star size={14} fill="currentColor" />{" "}
                          <span className="text-xs font-bold text-slate-600">
                            {v.feedback.rating}/5
                          </span>
                          <span className="text-xs text-slate-400 italic ml-2 truncate max-w-[200px]">
                            "{v.feedback.comment}"
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-auto">
                      <select
                        value={v.status}
                        onChange={(e) =>
                          updateVisitStatus(v._id, e.target.value)
                        }
                        className="w-full sm:w-auto p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-bold outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        <option value="pending">{t`Pending`}</option>
                        <option value="scheduled">{t`Scheduled`}</option>
                        <option value="visited">{t`Visited`}</option>
                        <option value="cancelled">{t`Cancelled`}</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
