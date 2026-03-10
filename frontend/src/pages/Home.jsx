import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Map, Users } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import Testimonials from "../components/Testimonials";
import { Link } from "react-router-dom";

export default function Home() {
  const [properties, setProperties] = useState([]);

  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/listings")
      .then((res) => setProperties(res.data.slice(0, 3)))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings", {
        params: {
          location,
          type,
          minPrice,
          maxPrice,
          sort,
        },
      });

      setProperties(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="overflow-hidden bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      {/* HERO */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600"
            className="w-full h-full object-cover"
            alt="Luxury property"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-indigo-900/70 to-purple-900/60" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-6xl">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            Luxury Living <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Redefined
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto"
          >
            Discover verified premium lands and architecturally stunning homes
            designed for your future.
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-blue-400/30 grid md:grid-cols-6 gap-3 max-w-6xl mx-auto"
          >
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg px-3">
              <Search className="text-slate-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 outline-none bg-transparent"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 rounded-lg outline-none dark:bg-slate-800 dark:text-white"
            >
              <option value="">Property Type</option>
              <option value="Land">Land</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="p-3 rounded-lg outline-none dark:bg-slate-800 dark:text-white"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="p-3 rounded-lg outline-none dark:bg-slate-800 dark:text-white"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-3 rounded-lg outline-none dark:bg-slate-800 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price Low → High</option>
              <option value="price_high">Price High → Low</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-lg px-6 py-3 hover:shadow-xl transition-all active:scale-95"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-12 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around gap-8">
          {[
            {
              icon: <ShieldCheck className="text-blue-600" />,
              title: "Verified Assets",
            },
            {
              icon: <Map className="text-purple-600" />,
              title: "Prime Locations",
            },
            {
              icon: <Users className="text-indigo-600" />,
              title: "10k+ Happy Clients",
            },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300"
            >
              <span className="p-3 bg-blue-50 dark:bg-slate-800 rounded-full">
                {badge.icon}
              </span>
              {badge.title}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto py-24 px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Collection
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Hand-picked properties just for you
            </p>
          </div>

          <Link
            to="/listings"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600"
          >
            <span className="font-bold flex items-center gap-1">
              View All <ArrowRight size={18} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      </section>

      <Testimonials />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-[3rem] p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Invest in Your Future Today
          </h2>

          <p className="text-slate-300 max-w-xl mx-auto mb-10">
            Join thousands of investors securing premium land and homes through
            our verified platform.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="bg-white text-purple-500 px-10 py-4 rounded-2xl font-bold"
            >
              Browse Properties
            </Link>

            <Link
              to="/contact"
              className="bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold"
            >
              Contact Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
