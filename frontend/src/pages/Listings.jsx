import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Flame,
  Gem,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Listings() {
  useLingui();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Set default maxPrice to a very high number so nothing is hidden by default
  const [filter, setFilter] = useState({
    type: "",
    search: "",
    sort: "newest",
    maxPrice: 100000000,
    radius: 0,
    lat: null,
    lng: null,
  });

  const debounceRef = useRef(null);

  // --- CURATED COLLECTIONS LOGIC ---
  const trending = useMemo(
    () =>
      [...properties]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 4),
    [properties],
  );
  const hotDeals = useMemo(
    () => properties.filter((p) => p.price < 5000000).slice(0, 4),
    [properties],
  );
  // Now looks specifically for the 'featured' flag from your Admin Dashboard
  const premium = useMemo(
    () => properties.filter((p) => p.featured === true).slice(0, 4),
    [properties],
  );

  const geocodeLocation = async (address) => {
    if (!address || address.length < 3) return null;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${address}&limit=1`,
      );
      if (res.data.length > 0)
        return { lat: res.data[0].lat, lng: res.data[0].lon };
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      let currentFilter = { ...filter };
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

  // If user is searching or viewing map, show standard grid. Otherwise show "Curated"
  const isSearching =
    filter.search !== "" ||
    filter.type !== "" ||
    filter.radius > 0 ||
    filter.maxPrice < 100000000;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* 1. HEADER */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t`Search by city, area or project...`}
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 focus:ring-2 ring-blue-500 outline-none dark:text-white font-medium transition-all"
              />
            </div>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${showFilters ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "bg-slate-100 dark:bg-slate-900 dark:text-white"}`}
              >
                <SlidersHorizontal size={20} /> {t`Filters`}
              </button>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl ${viewMode === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-400"}`}
                >
                  <LayoutList size={20} />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-3 rounded-xl ${viewMode === "map" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-400"}`}
                >
                  <MapIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* FILTER PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-3">{t`Category`}</label>
                  <select
                    value={filter.type}
                    onChange={(e) =>
                      setFilter({ ...filter, type: e.target.value })
                    }
                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 dark:text-white shadow-sm border-none"
                  >
                    <option value="">{t`All Properties`}</option>
                    <option value="Land">{t`Plots & Land`}</option>
                    <option value="House">{t`Houses`}</option>
                    <option value="Apartment">{t`Apartments`}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-3">
                    {t`Max Budget`}:{" "}
                    <span className="text-blue-600">
                      ₹{(filter.maxPrice / 100000).toFixed(0)}L
                    </span>
                  </label>
                  <input
                    type="range"
                    min="500000"
                    max="100000000"
                    step="500000"
                    value={filter.maxPrice}
                    onChange={(e) =>
                      setFilter({ ...filter, maxPrice: e.target.value })
                    }
                    className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none accent-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-3">
                    {t`Radius`}:{" "}
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
                    className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none accent-blue-600"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-32">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-24">
            {isSearching || viewMode === "map" ? (
              /* --- SEARCH / MAP VIEW --- */
              <section>
                <h2 className="text-3xl font-black mb-8">
                  {t`Search Results`} ({properties.length})
                </h2>
                {viewMode === "list" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {properties.map((p) => (
                      <PropertyCard key={p._id} property={p} />
                    ))}
                  </div>
                ) : (
                  <div className="h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                    <MapSearch properties={properties} />
                  </div>
                )}
              </section>
            ) : (
              /* --- CURATED WORLD CLASS VIEW --- */
              <>
                {/* 1. PREMIUM SECTION (Featured only) */}
                {premium.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                        <Gem size={24} />
                      </div>
                      <h2 className="text-3xl font-black dark:text-white tracking-tight">{t`Exclusive Collections`}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {premium.slice(0, 2).map((p) => (
                        <motion.div
                          whileHover={{ y: -10 }}
                          key={p._id}
                          className="relative h-[400px] rounded-[2.5rem] overflow-hidden group shadow-xl"
                        >
                          <img
                            src={p.images[0]}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 p-8 w-full">
                            <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">{t`Featured`}</span>
                            <h3 className="text-2xl font-bold text-white mb-2">
                              {p.title}
                            </h3>
                            <div className="flex justify-between items-center">
                              <p className="text-amber-400 font-black text-xl">
                                ₹{(p.price / 10000000).toFixed(2)} Cr
                              </p>
                              <button
                                onClick={() => navigate(`/property/${p._id}`)}
                                className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-black transition-all"
                              >
                                <ArrowRight />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. TRENDING SECTION */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                      <TrendingUp size={24} />
                    </div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">{t`Trending Now`}</h2>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
                    {trending.map((p) => (
                      <div key={p._id} className="min-w-[300px] snap-start">
                        <PropertyCard property={p} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. RECENT ARRIVALS (THIS FIXES YOUR MISSING PROPERTY ISSUE) */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                      <Clock size={24} />
                    </div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">{t`New Arrivals`}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Shows everything sorted by newest, so no property is hidden */}
                    {properties.slice(0, 8).map((p) => (
                      <PropertyCard key={p._id} property={p} />
                    ))}
                  </div>
                  {properties.length > 8 && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => setFilter({ ...filter, search: " " })} // Triggers standard grid view
                        className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-transform"
                      >
                        {t`View All Properties`}
                      </button>
                    </div>
                  )}
                </section>

                {/* 4. HOT DEALS */}
                <section className="bg-slate-900 dark:bg-blue-900/20 rounded-[4rem] p-8 md:p-12 relative overflow-hidden">
                  <Sparkles
                    className="absolute top-10 right-10 text-white/5"
                    size={150}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg animate-pulse">
                        <Flame size={24} />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight">{t`Under Market Deals`}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {hotDeals.length > 0 ? (
                        hotDeals.map((p) => (
                          <PropertyCard key={p._id} property={p} />
                        ))
                      ) : (
                        <p className="text-white/50">{t`No deals currently available.`}</p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
