import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MapSearch from "../components/MapSearch";
import { Map as MapIcon, LayoutList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Listings() {
  // Ensure translations update immediately
  useLingui();

  const locationHook = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'
  const [filter, setFilter] = useState({
    type: "",
    search: "",
    sort: "newest",
  });
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef(null);

  const fetchProperties = async (currentFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilter.type) params.append("type", currentFilter.type);
      if (currentFilter.search) params.append("location", currentFilter.search);
      if (currentFilter.sort) params.append("sort", currentFilter.sort);

      const res = await axios.get(
        `http://localhost:5000/api/listings?${params.toString()}`,
      );
      setProperties(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(locationHook.search));
    setFilter({
      type: params.type || "",
      search: params.location || "",
      sort: params.sort || "newest",
    });
    setSearchText(params.location || "");
  }, [locationHook.search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const query = new URLSearchParams();
      if (filter.type) query.append("type", filter.type);
      if (filter.search) query.append("location", filter.search);
      if (filter.sort) query.append("sort", filter.sort);
      navigate(`/listings?${query.toString()}`, { replace: true });

      fetchProperties(filter);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [filter, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t`Available Listings`}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {properties.length} {t`Properties`} {t`found`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search and Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder={t`Search by location...`}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setFilter((prev) => ({ ...prev, search: e.target.value }));
                }}
                className="border border-blue-100 dark:border-slate-800 p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus:ring-2 ring-blue-500/20 outline-none w-full sm:w-64 dark:text-white"
              />

              <select
                value={filter.type}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, type: e.target.value }))
                }
                className="border border-blue-100 dark:border-slate-800 p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm outline-none dark:text-white cursor-pointer"
              >
                <option value="">{t`All Types`}</option>
                <option value="Land">{t`Land`}</option>
                <option value="House">{t`House`}</option>
                <option value="Apartment">{t`Apartment`}</option>
              </select>

              <select
                value={filter.sort}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, sort: e.target.value }))
                }
                className="border border-blue-100 dark:border-slate-800 p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm outline-none dark:text-white cursor-pointer"
              >
                <option value="newest">{t`Newest`}</option>
                <option value="oldest">{t`Oldest`}</option>
                <option value="price_low">{t`Price Low → High`}</option>
                <option value="price_high">{t`Price High → Low`}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm w-full sm:w-auto justify-center">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <LayoutList size={18} />
                <span className="text-sm">{t`Browse Properties`}</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                <MapIcon size={18} />
                <span className="text-sm">{t`Location`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "list" ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                >
                  {properties.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                      <p className="text-lg text-slate-500 font-medium">{t`No properties found.`}</p>
                    </div>
                  ) : (
                    properties.map((p) => (
                      <PropertyCard key={p._id} property={p} />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="map-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full"
                >
                  {properties.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800">
                      <p className="text-lg text-slate-500 font-medium">{t`No properties found.`}</p>
                    </div>
                  ) : (
                    <MapSearch properties={properties} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
