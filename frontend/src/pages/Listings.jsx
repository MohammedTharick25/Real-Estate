import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";

export default function Listings() {
  const locationHook = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t`Available Listings`}
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder={t`Search by location...`}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setFilter((prev) => ({ ...prev, search: e.target.value }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchProperties(filter);
              }}
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 flex-1"
            />

            <select
              value={filter.type}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, type: e.target.value }))
              }
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800"
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
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800"
            >
              <option value="newest">{t`Newest`}</option>
              <option value="oldest">{t`Oldest`}</option>
              <option value="price_low">{t`Price: Low → High`}</option>
              <option value="price_high">{t`Price: High → Low`}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500">{t`No properties found.`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
