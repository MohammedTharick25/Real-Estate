import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import MapSearch from "../components/MapSearch";
import {
  Map as MapIcon,
  LayoutList,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Listings() {
  useLingui();
  const locationHook = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // Toggle advanced filters

  // Filter States
  const [filter, setFilter] = useState({
    type: "",
    search: "",
    sort: "newest",
    maxPrice: 10000000, // Default 1 Crore
    radius: 0, // 0 means ignore radius
    lat: null,
    lng: null,
  });

  const debounceRef = useRef(null);

  // Helper: Geocode location string to Lat/Lng
  const geocodeLocation = async (address) => {
    if (!address || address.length < 3) return null;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`,
      );
      if (res.data.length > 0) {
        return { lat: res.data[0].lat, lng: res.data[0].lon };
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
    return null;
  };

  const fetchProperties = async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.type) params.append("type", f.type);
      if (f.search) params.append("location", f.search);
      if (f.sort) params.append("sort", f.sort);
      if (f.maxPrice) params.append("maxPrice", f.maxPrice);

      if (f.radius > 0 && f.lat && f.lng) {
        params.append("lat", f.lat);
        params.append("lng", f.lng);
        params.append("radius", f.radius);
      }

      const res = await axios.get(
        `http://localhost:5000/api/listings?${params.toString()}`,
      );
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search/Filter changes with Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      let currentFilter = { ...filter };

      // If radius is set, geocode the search text first
      if (filter.radius > 0 && filter.search) {
        const coords = await geocodeLocation(filter.search);
        if (coords) {
          currentFilter.lat = coords.lat;
          currentFilter.lng = coords.lng;
        }
      }

      fetchProperties(currentFilter);
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [filter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar & Primary Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t`Search city or neighborhood...`}
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl focus:ring-2 ring-blue-500 outline-none dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${showFilters ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 dark:text-white shadow-md"}`}
            >
              <SlidersHorizontal size={20} /> {t`Filters`}
            </button>
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-md">
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}
              >
                <LayoutList />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-3 rounded-xl ${viewMode === "map" ? "bg-blue-100 text-blue-600" : "text-slate-400"}`}
              >
                <MapIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t`Property Type`}</label>
                  <select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter({ ...filter, type: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">{t`All Types`}</option>
                    <option value="Land">{t`Land`}</option>
                    <option value="House">{t`House`}</option>
                    <option value="Apartment">{t`Apartment`}</option>
                  </select>
                </div>

                {/* Price Range Slider */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    {t`Max Price`}:{" "}
                    <span className="text-blue-600">
                      ₹{(filter.maxPrice / 100000).toFixed(1)} Lakhs
                    </span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="50000000"
                    step="100000"
                    value={filter.maxPrice}
                    onChange={(e) =>
                      setFilter({ ...filter, maxPrice: e.target.value })
                    }
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>1L</span>
                    <span>5Cr</span>
                  </div>
                </div>

                {/* Radius Search */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    {t`Distance Radius`}:{" "}
                    <span className="text-blue-600">{filter.radius} km</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={filter.radius}
                    onChange={(e) =>
                      setFilter({ ...filter, radius: e.target.value })
                    }
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">{t`Requires location text (e.g., Chennai)`}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {viewMode === "list" ? (
              properties.length > 0 ? (
                properties.map((p) => <PropertyCard key={p._id} property={p} />)
              ) : (
                <div className="col-span-full text-center py-20 text-slate-400">{t`No properties matching your criteria.`}</div>
              )
            ) : (
              <div className="col-span-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <MapSearch properties={properties} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
