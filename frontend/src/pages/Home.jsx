import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Map, Users } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import Testimonials from "../components/Testimonials";
import { Link } from "react-router-dom";

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/listings")
      .then((res) => setProperties(res.data.slice(0, 3)))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="overflow-hidden bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      {/* HERO SECTION */}
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

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Luxury Living <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Redefined.
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
            className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl shadow-2xl shadow-blue-900/40 border border-blue-400/30 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto"
          >
            <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl px-4 py-2">
              <Search className="text-slate-400 mr-2" />

              <input
                type="text"
                placeholder="Enter Location..."
                className="w-full p-2 outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <select className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none font-bold text-slate-700 dark:text-slate-200">
              <option>Property Type</option>
              <option>Land</option>
              <option>House</option>
            </select>

            <button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-blue-600/40">
              Search Now
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
              <span className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-full">
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
            className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
          >
            <span className="font-bold flex items-center gap-1">
              View All <ArrowRight size={18} />
            </span>
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {properties.map((p) => (
            <motion.div
              key={p._id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <PropertyCard property={p} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Invest in Your Future <br />
              Today.
            </h2>

            <p className="text-slate-300 max-w-xl mx-auto mb-10 text-lg">
              Join thousands of investors securing premium land and homes
              through our verified platform.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all">
                Browse Properties
              </button>

              <button className="bg-white/10 text-white border border-white/30 backdrop-blur-md px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                Contact Agent
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
