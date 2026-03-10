import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState({ type: "", search: "" });
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef(null);

  const fetchProperties = async (currentFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilter.type) params.append("type", currentFilter.type);
      // Ensure your Backend is looking for 'location'
      if (currentFilter.search) params.append("location", currentFilter.search);

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

    debounceRef.current = setTimeout(() => {
      fetchProperties(filter);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [filter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Available Listings
          </h1>

          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by location..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                // Trigger the debounced effect by updating filter
                setFilter((prev) => ({ ...prev, search: e.target.value }));
              }}
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800"
            />

            <select
              value={filter.type}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, type: e.target.value }))
              }
              className="border border-blue-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800"
            >
              <option value="">All Types</option>
              <option value="Land">Land</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>
        </div>

        {/* FIX: Instead of returning early, we conditionally render the content. 
           This prevents the search bar from disappearing.
        */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500">No properties found.</p>
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
