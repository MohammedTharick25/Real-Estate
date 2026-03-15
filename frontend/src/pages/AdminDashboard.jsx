import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Menu,
  X,
  LayoutGrid,
  Calendar,
  Star,
  Search,
  MapPin,
  RefreshCw,
  BarChart3,
  Users,
  IndianRupee,
  TrendingUp,
  Eye,
  Phone,
  Video,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@lingui/macro";
import LocationPicker from "../components/LocationPicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    size: "",
    propertyType: "Land",
    description: "",
    latitude: 13.0827,
    longitude: 80.2707,
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  // FETCH FUNCTIONS
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Stats error", err);
    }
  };

  const fetchListings = async () => {
    const res = await axios.get("http://localhost:5000/api/listings");
    setListings(res.data);
  };

  const fetchVisits = async () => {
    const res = await axios.get("http://localhost:5000/api/visits/admin");
    setVisits(res.data);
  };

  // INITIAL LOAD & AUTO-POLLING
  useEffect(() => {
    fetchListings();
    fetchVisits();
    fetchStats();
    const poll = setInterval(fetchStats, 10000); // Auto-update every 10s
    return () => clearInterval(poll);
  }, []);

  // HANDLERS
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Sold" : "Available";
    await axios.patch(`http://localhost:5000/api/listings/${id}/status`, {
      status: newStatus,
    });
    fetchListings();
    fetchStats();
  };

  const updateVisitStatus = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/visits/${id}/status`, {
      status,
    });
    fetchVisits();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm(t`Delete permanently?`)) {
      await axios.delete(`http://localhost:5000/api/listings/${id}`);
      fetchListings();
      fetchStats();
    }
  };

  const API_TOKEN = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;

  const handleSearchAddress = async () => {
    if (!formData.location) return alert(t`Please type an address first`);
    try {
      const res = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${API_TOKEN}&q=${encodeURIComponent(formData.location)}&format=json`,
      );
      if (res.data?.[0]) {
        const { lat, lon, display_name } = res.data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          location: display_name,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMapPinSelect = async (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const res = await axios.get(
        `https://us1.locationiq.com/v1/reverse.php?key=${API_TOKEN}&lat=${lat}&lon=${lng}&format=json`,
      );
      if (res.data?.display_name)
        setFormData((prev) => ({ ...prev, location: res.data.display_name }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location)
      return alert("Fill required fields!");

    setIsUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Array.from(images).forEach((img) => data.append("images", img));
    Array.from(videos).forEach((vid) => data.append("videos", vid));

    try {
      await axios.post("http://localhost:5000/api/listings", data);
      alert(t`Success! Property Published.`);

      // RESET FORM & FILES
      setFormData({
        title: "",
        price: "",
        location: "",
        size: "",
        propertyType: "Land",
        description: "",
        latitude: 13.0827,
        longitude: 80.2707,
      });
      setImages([]);
      setVideos([]);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";

      setActiveTab("manage");
      fetchListings();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  // Dynamic sum of all views from properties
  const totalViewsCount =
    stats?.topProperties?.reduce((acc, curr) => acc + (curr.views || 0), 0) ||
    0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col md:flex-row transition-all">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center text-white">
        <h2 className="font-black uppercase tracking-tighter italic">
          AdminHub
        </h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white p-6 flex flex-col transition-all ${sidebarOpen ? "block" : "hidden md:flex"}`}
          >
            <h2 className="text-xl font-black uppercase mb-10 px-2 tracking-widest italic">
              Admin<span className="text-blue-500">Hub</span>
            </h2>
            <nav className="space-y-2 flex-1">
              <SideBtn
                active={activeTab === "overview"}
                icon={<BarChart3 size={20} />}
                label={t`Analytics`}
                onClick={() => setActiveTab("overview")}
              />
              <SideBtn
                active={activeTab === "add"}
                icon={<Plus size={20} />}
                label={t`Add Property`}
                onClick={() => setActiveTab("add")}
              />
              <SideBtn
                active={activeTab === "manage"}
                icon={<LayoutGrid size={20} />}
                label={t`Inventory`}
                onClick={() => setActiveTab("manage")}
              />
              <SideBtn
                active={activeTab === "visits"}
                icon={<Calendar size={20} />}
                label={t`Visits`}
                onClick={() => setActiveTab("visits")}
              />
            </nav>
            <div className="mt-auto flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t`Live Stats Connected`}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && stats && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                  title={t`Revenue`}
                  value={`₹${(stats.inventoryValue?.find((v) => v._id === "Sold")?.total || 0).toLocaleString()}`}
                  icon={<IndianRupee className="text-blue-600" />}
                  trend="+12%"
                />
                <KPICard
                  title={t`Active`}
                  value={stats.kpis.totalListings}
                  icon={<Building2 className="text-emerald-600" />}
                  trend="Live"
                />
                <KPICard
                  title={t`Total Views`}
                  value={totalViewsCount.toLocaleString()}
                  icon={<Eye className="text-blue-500" />}
                  trend="Sync"
                />
                <KPICard
                  title={t`Conversion`}
                  value={`${stats?.kpis?.conversionRate || 0}%`}
                  icon={<TrendingUp className="text-green-600" />}
                  trend="Views → Visits"
                />
                <KPICard
                  title={t`Rating`}
                  value={`${(stats.avgRating || 0).toFixed(1)}/5`}
                  icon={<Star className="text-amber-600" />}
                  trend="Avg"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart: Monthly Inquiries */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 tracking-tight">
                    <TrendingUp size={18} className="text-blue-500" />{" "}
                    {t`Monthly Visit Requests`}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.visitTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="_id" tick={{ fontSize: 12 }} />

                        <YAxis tick={{ fontSize: 12 }} />

                        <Tooltip formatter={(v) => [v, "Requests"]} />

                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          fill="#3b82f610"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Inventory */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">{t`Value Share (₹)`}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.inventoryValue}
                          dataKey="total"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          stroke="none"
                        >
                          {stats.inventoryValue?.map((e, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % 4]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart: Property Views */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Eye size={18} className="text-blue-500" />{" "}
                    {t`Popularity Analytics (Views)`}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* LEFT: Bar Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topProperties} layout="vertical">
                          <XAxis type="number" hide />

                          <YAxis
                            dataKey="title"
                            type="category"
                            width={120}
                            tick={{ fontSize: 10, fontWeight: "bold" }}
                            axisLine={false}
                          />

                          <Tooltip formatter={(v) => [v, t`Views`]} />

                          <Bar
                            dataKey="views"
                            fill="#3b82f6"
                            radius={[0, 10, 10, 0]}
                            barSize={25}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* RIGHT: Top 4 Ranked Properties */}
                    <div className="space-y-3">
                      {stats.topProperties.slice(0, 4).map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700"
                        >
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                            {i + 1}
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-sm truncate dark:text-white">
                              {p.title}
                            </p>

                            <p className="text-xs text-blue-500 font-black uppercase tracking-tighter">
                              {p.views} {t`Total Views`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NEW SECTION — Property Performance Insights */}
                  <div className="mt-8">
                    <h4 className="text-sm font-black uppercase text-slate-400 mb-4">
                      {t`Top Property Insights`}
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4">
                      {stats.topProperties.slice(0, 3).map((p, i) => (
                        <div
                          key={i}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700"
                        >
                          <p className="font-bold text-sm dark:text-white truncate">
                            {p.title}
                          </p>

                          <p className="text-xs text-blue-500 font-bold mt-1">
                            {p.views} Views
                          </p>

                          <p className="text-xs text-green-600 font-bold mt-1">
                            ₹{p.price?.toLocaleString?.() || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADD PROPERTY VIEW */}
          {activeTab === "add" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border dark:border-slate-800 max-w-4xl mx-auto shadow-sm"
            >
              <h2 className="text-2xl font-black mb-8 tracking-tight italic">{t`Publish Property`}</h2>
              <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-6"
              >
                <FormInput
                  label={t`Title`}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <FormInput
                  label={t`Price (₹)`}
                  value={formData.price}
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />

                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl space-y-4 border dark:border-slate-700">
                  <p className="font-bold text-xs uppercase text-slate-400 tracking-widest">{t`Location & Coordinates`}</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-4 rounded-xl border dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                      placeholder={t`Search Location...`}
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 transition"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="any"
                      className="p-4 rounded-xl border dark:bg-slate-900 dark:border-slate-700 outline-none"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <input
                      type="number"
                      step="any"
                      className="p-4 rounded-xl border dark:bg-slate-900 dark:border-slate-700 outline-none"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <LocationPicker
                    selectedLocation={{
                      lat: formData.latitude,
                      lng: formData.longitude,
                    }}
                    onLocationSelect={handleMapPinSelect}
                  />
                </div>

                <FormInput
                  label={t`Size (sqft)`}
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                />
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400">{t`Type`}</label>
                  <select
                    value={formData.propertyType}
                    className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, propertyType: e.target.value })
                    }
                  >
                    <option value="Land">Land</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
                <textarea
                  value={formData.description}
                  rows="4"
                  className="md:col-span-2 w-full p-5 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  placeholder={t`Description`}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-3xl text-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Plus
                        className={`mb-1 ${images?.length > 0 ? "text-blue-500" : "text-slate-400"}`}
                      />
                      <span className="text-xs font-bold text-slate-500">{t`Photos`}</span>
                      <input
                        type="file"
                        ref={imageInputRef}
                        multiple
                        accept="image/*"
                        onChange={(e) => setImages(e.target.files)}
                        className="hidden"
                      />
                    </label>
                    {images?.length > 0 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                        {images.length} {t`Files`}
                      </div>
                    )}
                  </div>
                  <div className="relative p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-3xl text-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Video
                        className={`mb-1 ${videos?.length > 0 ? "text-blue-500" : "text-slate-400"}`}
                      />
                      <span className="text-xs font-bold text-slate-500">{t`Videos`}</span>
                      <input
                        type="file"
                        ref={videoInputRef}
                        multiple
                        accept="video/*"
                        onChange={(e) => setVideos(e.target.files)}
                        className="hidden"
                      />
                    </label>
                    {videos?.length > 0 && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                        {videos.length} {t`Files`}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  disabled={isUploading}
                  className="md:col-span-2 py-5 bg-blue-600 text-white rounded-xl font-black text-xl hover:shadow-xl transition-all"
                >
                  {isUploading ? t`Uploading...` : t`Publish Property`}
                </button>
              </form>
            </motion.div>
          )}

          {/* 3. VISITS VIEW (Unchanged as requested) */}
          {activeTab === "visits" && (
            <div className="grid md:grid-cols-2 gap-4">
              {visits.map((v) => (
                <div
                  key={v._id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-lg dark:text-white">
                        {v.name}
                      </h4>
                      <p className="text-blue-600 font-bold text-xs mb-2">
                        {v.propertyId?.title}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <Users size={12} /> {v.email}
                      </p>
                      <p className="text-[11px] text-blue-600 font-black flex items-center gap-2 mt-1">
                        <Phone size={12} /> {v.phone || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${v.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-slate-100"}`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <select
                    value={v.status}
                    onChange={(e) => updateVisitStatus(v._id, e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold outline-none cursor-pointer mt-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="visited">Visited</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* 4. INVENTORY VIEW (Unchanged as requested) */}
          {activeTab === "manage" && (
            <div className="grid grid-cols-1 gap-4">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <img
                      src={item.images[0]}
                      className="w-16 h-16 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="truncate">
                      <h4 className="font-bold truncate dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-blue-600 font-black">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(item._id, item.status)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${item.status === "Sold" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                    >
                      {item.status}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SideBtn({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-4 rounded-2xl transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800/50"}`}
    >
      <span className="mr-4">{icon}</span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );
}

function KPICard({ title, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          {icon}
        </div>
        <div className="text-[10px] font-black text-emerald-500">{trend}</div>
      </div>
      <h4 className="text-slate-500 font-bold text-xs uppercase">{title}</h4>
      <p className="text-2xl font-black mt-1 dark:text-white tracking-tighter">
        {value}
      </p>
    </div>
  );
}

function FormInput({ label, value, type = "text", onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400 ml-1">
        {label}
      </label>
      <input
        value={value}
        type={type}
        onChange={onChange}
        className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
      />
    </div>
  );
}
