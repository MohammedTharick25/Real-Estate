import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

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
import Swal from "sweetalert2";
import {
  UserX,
  UserCheck,
  ShieldAlert,
  Mail,
  ShieldCheck,
  Download,
} from "lucide-react";

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
    featured: false, // 👈 Add this
    amenities: "",
    latitude: 13.0827,
    longitude: 80.2707,
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/all");
      setUsers(res.data);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  // FETCH FUNCTIONS
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
      console.log("Full Stats from Server:", res.data);
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
    fetchUsers();

    const poll = setInterval(() => {
      fetchStats();
      fetchUsers();
    }, 5000); // Auto-update every 5s
    return () => clearInterval(poll);
  }, []);

  // HANDLERS
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Sold" : "Available";
    await axios.patch(`http://localhost:5000/api/listings/${id}/status`, {
      status: newStatus,
    });
    toast.success(t`Status updated to ${newStatus}`);
    await fetchListings();
    await fetchStats();
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/users/${userId}/block`,
      );
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const exportUsersToCSV = () => {
    const headers = ["Name,Email,Role,Status,Favorites\n"];
    const rows = users.map(
      (u) =>
        `${u.name},${u.email},${u.role},${u.isBlocked ? "Blocked" : "Active"},${u.favorites?.length || 0}`,
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `User_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: t`Delete User?`,
      text: t`This action is permanent and will remove all user data.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: t`Yes, delete`,
    });

    if (result.isConfirmed) {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      fetchUsers();
      Swal.fire("Deleted!", "User removed.", "success");
    }
  };

  const updateVisitStatus = async (id, status) => {
    try {
      // We use toast.promise to handle the loading state and the final message from backend
      await toast.promise(
        axios.patch(`http://localhost:5000/api/visits/${id}/status`, {
          status,
        }),
        {
          loading: t`Updating status...`,
          success: (res) => {
            // fetch data in background to update UI
            fetchVisits();
            fetchStats();
            // This returns the message we just added to the backend
            return res.data.message;
          },
          error: t`Failed to update status.`,
        },
        {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        },
      );
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await axios.delete(`http://localhost:5000/api/listings/${id}`);
      await fetchListings();
      await fetchStats();

      Swal.fire("Deleted!", "Property has been deleted.", "success");
    }
  };

  const API_TOKEN = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;

  const handleSearchAddress = async () => {
    if (!formData.location)
      return toast.error(t`Enter a location to search!`, { duration: 3000 });
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
        toast.success(t`Location synced!`);
      } else {
        toast.error(t`Location not found. Try a different query.`, {
          duration: 4000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(t`Failed to sync location.`);
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
      return toast.error(t`Fill required fields!`, { duration: 3000 });

    setIsUploading(true);

    const formattedAmenities = formData.amenities
      ? formData.amenities.split(",").map((a) => a.trim())
      : [];

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key !== "amenities") {
        data.append(key, formData[key]);
      }
    });

    // ✅ send amenities correctly
    formattedAmenities.forEach((a) => data.append("amenities", a));

    Array.from(images).forEach((img) => data.append("images", img));
    Array.from(videos).forEach((vid) => data.append("videos", vid));

    toast.promise(
      axios.post("http://localhost:5000/api/listings", data),
      {
        loading: t`Uploading property and media...`,
        success: () => {
          setFormData({
            /* reset logic */
          });
          setImages([]);
          setVideos([]);
          fetchListings();
          fetchStats();
          setActiveTab("manage");
          return <b>{t`Property Published Successfully!`}</b>;
        },
        error: <b>{t`Could not publish property.`}</b>,
      },
      {
        style: { borderRadius: "15px", background: "#333", color: "#fff" },
        success: { duration: 5000, icon: "🏠" },
      },
    );

    setIsUploading(false);
  };

  const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  // Dynamic sum of all views from properties
  const totalViewsCount =
    stats?.topProperties?.reduce((acc, curr) => acc + (curr.views || 0), 0) ||
    0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col lg:flex-row transition-all">
      {/* Mobile and Tablet Top Bar */}
      <div className="lg:hidden bg-slate-900 p-4 flex justify-between items-center text-white sticky top-0 z-[6000] shadow-xl">
        <h2 className="font-black uppercase tracking-tighter italic">
          AdminHub
        </h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-transform"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* BACKDROP: Only shows on Mobile/Tablet when sidebar is open */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[7000] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:sticky top-0 left-0 z-50 w-72 h-screen bg-slate-900 text-white p-6 flex flex-col overflow-y-auto transition-all ${
              sidebarOpen ? "block" : "hidden lg:flex"
            }`}
          >
            <h2 className="text-xl font-black uppercase mb-10 px-2 tracking-widest italic">
              Admin<span className="text-blue-500">Hub</span>
            </h2>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
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
      </AnimatePresence> */}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-[8000] w-72 bg-slate-900 text-white p-6 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black uppercase px-2 tracking-widest italic">
            Admin<span className="text-blue-500">Hub</span>
          </h2>
          {/* Close button inside sidebar for tablet/mobile */}
          <button
            className="lg:hidden p-2 hover:bg-slate-800 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <SideBtn
            active={activeTab === "overview"}
            icon={<BarChart3 size={20} />}
            label={t`Analytics`}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          />
          <SideBtn
            active={activeTab === "add"}
            icon={<Plus size={20} />}
            label={t`Add Property`}
            onClick={() => {
              setActiveTab("add");
              setSidebarOpen(false);
            }}
          />
          <SideBtn
            active={activeTab === "manage"}
            icon={<LayoutGrid size={20} />}
            label={t`Inventory`}
            onClick={() => {
              setActiveTab("manage");
              setSidebarOpen(false);
            }}
          />
          <SideBtn
            active={activeTab === "users"}
            icon={<Users size={20} />}
            label={t`Community`}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          />
          <SideBtn
            active={activeTab === "visits"}
            icon={<Calendar size={20} />}
            label={t`Visits`}
            onClick={() => {
              setActiveTab("visits");
              setSidebarOpen(false);
            }}
          />
        </nav>

        <div className="mt-auto flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {t`Live Stats Connected`}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && stats && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                  title={t`Sold Value`}
                  value={`₹${(stats?.kpis?.soldValue || 0).toLocaleString()}`}
                  icon={<IndianRupee className="text-blue-600" />}
                  trend="+12%"
                />

                <KPICard
                  title={t`Commission Revenue`}
                  value={`₹${(stats?.kpis?.revenue || 0).toLocaleString()}`}
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
                  /* Ensure we handle both potential locations: stats.avgRating or stats.kpis.avgRating */
                  value={
                    stats?.kpis?.avgRating !== undefined
                      ? `${Number(stats.kpis.avgRating).toFixed(1)}/5`
                      : "0.0/5"
                  }
                  icon={
                    <Star
                      className={
                        stats?.kpis?.avgRating > 0
                          ? "text-amber-500"
                          : "text-slate-300"
                      }
                    />
                  }
                  /* Dynamically show review count */
                  trend={
                    stats?.kpis?.reviewCount !== undefined
                      ? `${stats.kpis.reviewCount} ${t`Reviews`}`
                      : t`No Reviews`
                  }
                  color="amber"
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
              <h2 className="text-2xl font-black mb-8 tracking-tight italic">
                {t`Publish Property`}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* TITLE */}
                <FormInput
                  label={t`Title`}
                  placeholder={t`Luxurious 3BHK in Downtown`}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />

                {/* PRICE */}
                <div className="space-y-1">
                  <FormInput
                    label={t`Price (₹)`}
                    placeholder={t`Enter price`}
                    value={formData.price}
                    type="number"
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  {formData.price && (
                    <p className="text-xs text-green-600 font-bold">
                      ₹{Number(formData.price).toLocaleString()}
                    </p>
                  )}
                </div>

                <FormInput
                  label={t`Commission (%)`}
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.commission || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, commission: e.target.value })
                  }
                />

                {/* AMENITIES */}
                <FormInput
                  label={t`Amenities (comma separated)`}
                  placeholder={t`Pool, Parking, Garden`}
                  value={formData.amenities || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                />

                {/* LOCATION BLOCK */}
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl space-y-4 border dark:border-slate-700">
                  <p className="font-bold text-xs uppercase text-slate-400 tracking-widest">
                    {t`Location & Coordinates`}
                  </p>

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

                {/* SIZE */}
                <FormInput
                  className="flex-1 p-4 rounded-xl border dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                  label={t`Size (sqft/Acres)`}
                  placeholder={t`e.g. 1500 Sq Ft or 0.5 Acres`}
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                />

                {/* TYPE */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400">
                    {t`Type`}
                  </label>

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

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <textarea
                    value={formData.description}
                    rows="4"
                    maxLength="500"
                    className="w-full p-5 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    placeholder={t`Description`}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {formData.description?.length || 0}/500
                  </p>
                </div>

                {/* FEATURED TOGGLE */}
                <div className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                  />
                  <span className="text-sm font-bold">{t`Featured Property`}</span>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-3xl text-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Plus className="mb-1 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">
                        {t`Photos`}
                      </span>

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
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {Array.from(images).map((img, i) => (
                          <img
                            key={i}
                            src={URL.createObjectURL(img)}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* VIDEO UPLOAD */}
                  <div className="relative p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed rounded-3xl text-center">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Video className="mb-1 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">
                        {t`Videos`}
                      </span>

                      <input
                        type="file"
                        ref={videoInputRef}
                        multiple
                        accept="video/*"
                        onChange={(e) => setVideos(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  disabled={isUploading}
                  className="md:col-span-2 py-5 bg-blue-600 text-white rounded-xl font-black text-xl hover:shadow-xl transition-all"
                >
                  {isUploading ? t`Uploading...` : t`Publish Property`}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Header & Search Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{t`User Directory`}</h2>
                  <p className="text-slate-500 text-sm">
                    {users.length} {t`Registered members`}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={t`Search by name or email...`}
                      className="pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl w-full border-none outline-none focus:ring-2 ring-blue-500/20"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 transition-colors">
                    <Download
                      size={20}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </button>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Change the mapping for users to include Account Age and Self-Protection */}
                {users
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase()),
                  )
                  .map((u) => {
                    // 🛡️ Self-Protection: Identify yourself (the master admin)
                    // Replace 'your-email@example.com' with your actual admin email
                    const isMasterAdmin = u.email === "Estatera@gmail.com";

                    return (
                      <motion.div
                        layout
                        key={u._id}
                        className={`relative group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${u.isBlocked ? "border-red-200 bg-red-50/30" : "border-slate-100 dark:border-slate-800"}`}
                      >
                        {/* NEW: Account Age Tag */}
                        <div className="flex gap-2">
                          {isMasterAdmin ? (
                            // Show a "Master Admin" label instead of buttons for you
                            <div className="w-full py-3 bg-blue-600 text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                              <ShieldCheck size={14} /> System Owner (Protected)
                            </div>
                          ) : (
                            // Show control buttons for everyone else
                            <>
                              <button
                                onClick={() => handleToggleBlock(u._id)}
                                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                                  u.isBlocked
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-900 text-white"
                                }`}
                              >
                                {u.isBlocked ? "Unblock User" : "Block User"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                          <img
                            src={
                              u.image ||
                              `https://ui-avatars.com/api/?name=${u.name}&background=random`
                            }
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                            alt=""
                          />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold dark:text-white truncate">
                                {u.name}
                              </h4>
                              {isMasterAdmin && (
                                <ShieldCheck
                                  size={16}
                                  className="text-blue-500"
                                />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                              Engagement
                            </p>
                            <div className="flex items-center gap-2">
                              <Star size={12} className="text-amber-500" />
                              <span className="font-bold text-sm dark:text-white">
                                {u.favorites?.length || 0} Saved
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                              Status
                            </p>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                            >
                              {u.isBlocked ? "SUSPENDED" : "ACTIVE"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {/* Only show buttons if the user is NOT the Master Admin */}
                          {!isMasterAdmin ? (
                            <>
                              <button
                                onClick={() => handleToggleBlock(u._id)}
                                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                  u.isBlocked
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                    : "bg-slate-900 text-white hover:bg-red-600"
                                }`}
                              >
                                {u.isBlocked ? (
                                  <UserCheck size={16} />
                                ) : (
                                  <UserX size={16} />
                                )}
                                {u.isBlocked ? "Restore User" : "Block Access"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-center rounded-2xl text-[10px] font-black uppercase tracking-tighter">
                              System Master (Protected)
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
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
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${v.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-slate-100"}
                      ${v.status === "visited" ? "bg-green-100 text-green-600" : "bg-slate-100 dark:bg-slate-800"}
                      ${v.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-slate-100 dark:bg-slate-800"}`}
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

function KPICard({ title, value, icon, trend, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        {/* Dynamic color background for icon */}
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.slate}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
          {trend}
        </div>
      </div>
      <h4 className="text-slate-500 font-bold text-xs uppercase tracking-tighter">
        {title}
      </h4>
      <p className="text-2xl font-black mt-1 dark:text-white tracking-tight">
        {value}
      </p>
    </div>
  );
}

function FormInput({ label, value, type = "text", onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400 ml-1">
        {label}
      </label>
      <input
        value={value}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
      />
    </div>
  );
}
