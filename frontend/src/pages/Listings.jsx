import { useState, useEffect } from "react";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { debounce } from "lodash";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState({ type: "", search: "" });
  const [loading, setLoading] = useState(true);

  // Debounced fetch function
  const fetchProperties = debounce(async (filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.search) params.append("location", filter.search);

      const res = await axios.get(
        `http://localhost:5000/api/listings?${params.toString()}`,
      );
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 500); // 500ms delay after user stops typing

  // Run fetch whenever filter changes
  useEffect(() => {
    fetchProperties(filter);

    // Cleanup debounce on unmount
    return () => fetchProperties.cancel();
  }, [filter]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Available Listings
          </h1>

          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by location..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Land">Land</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500 dark:text-slate-400">
              No properties found.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Try changing filters or search terms.
            </p>
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
