import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Ruler,
  Building,
  ArrowLeft,
  Share2,
  Heart,
  ShieldCheck,
  Grid,
  Calculator,
  IndianRupee,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function PropertyDetails() {
  useLingui();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/listings/${id}`)
      .then((res) => {
        setProperty(res.data);
        setLoanAmount(res.data.price); // Auto-fill loan amount
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // EMI Calculation Logic
  const emiDetails = useMemo(() => {
    const P = loanAmount;
    const R = interestRate / 12 / 100;
    const N = tenure * 12;

    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emiCalc * N;
    const totalInterest = totalPayment - P;

    return {
      monthlyEmi: emiCalc || 0,
      totalInterest: totalInterest || 0,
      totalPayment: totalPayment || 0,
    };
  }, [loanAmount, interestRate, tenure]);

  const handleRequestVisit = async (e) => {
    e.preventDefault();
    if (!user) return alert(t`Account created! Please login.`);

    try {
      await axios.post("http://localhost:5000/api/visits", {
        propertyId: id,
        userId: user.user.id,
        name: user.user.name,
        email: user.user.email,
      });
      alert(t`Message sent successfully!`);
    } catch (err) {
      alert(t`Failed to send message`);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!property)
    return <p className="text-center py-20">{t`Property not found`}</p>;

  const mediaList = [
    ...(property.videos?.[0] ? [property.videos[0]] : []),
    ...(property.images || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black min-h-screen pb-24 md:pb-12 transition-colors"
    >
      {/* PHOTO MODAL (Same as before) */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex justify-between items-center border-b dark:border-slate-800 z-10">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full"
              >
                <ArrowLeft />
              </button>
              <h2 className="font-bold dark:text-white">
                {t`Media`} ({mediaList.length})
              </h2>
              <div className="w-10"></div>
            </div>
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {mediaList.map((media, i) =>
                i === 0 && property.videos?.[0] ? (
                  <video
                    key={i}
                    src={media}
                    controls
                    className="w-full rounded-2xl shadow-lg"
                  />
                ) : (
                  <img
                    key={i}
                    src={media}
                    className="w-full rounded-2xl shadow-lg"
                    alt="Property Media"
                  />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600"
        >
          <ArrowLeft size={20} />{" "}
          <span className="hidden sm:inline">{t`Back`}</span>
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full">
            <Share2 size={20} />
          </button>
          <button className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* GALLERY (Same as before) */}
      <div className="max-w-7xl mx-auto md:px-4 mb-8">
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-3xl overflow-hidden shadow-lg relative">
          {mediaList.slice(0, 5).map((media, i) => (
            <div
              key={i}
              className={`overflow-hidden group cursor-pointer ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              onClick={() => setShowAllPhotos(true)}
            >
              {i === 0 && property.videos?.[0] ? (
                <video src={media} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={media}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Media"
                />
              )}
              {i === 4 && mediaList.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    +{mediaList.length - 5} {t`More`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* PROPERTY HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {property.propertyType}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${property.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {property.status}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
              {property.title}
            </h1>
            <p className="flex items-center text-slate-500 dark:text-slate-400 text-lg">
              <MapPin size={20} className="mr-2 text-blue-600" />{" "}
              {property.location}
            </p>
          </div>

          <div className="flex gap-4 py-8 border-y dark:border-slate-800 mb-10 overflow-x-auto">
            <Feature
              icon={<Ruler />}
              label={t`Total Area`}
              value={property.size}
            />
            <Feature
              icon={<Building />}
              label={t`Structure`}
              value={property.propertyType}
            />
            <Feature
              icon={<ShieldCheck className="text-green-500" />}
              label={t`Verification`}
              value={t`Approved`}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-12">
            <h3 className="text-2xl font-black text-blue-600 mb-4">{t`The Property`}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* --- NEW: EMI CALCULATOR SECTION --- */}
          <div className="mb-12 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-blue-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-600 rounded-2xl text-white">
                <Calculator size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t`EMI Calculator`}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm font-bold mb-2 dark:text-slate-300">
                    <span>{t`Loan Amount`} (₹)</span>
                    <span className="text-blue-600">
                      ₹{loanAmount.toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max={property.price * 1.5}
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm font-bold mb-2 dark:text-slate-300">
                    <span>{t`Interest Rate`} (%)</span>
                    <span className="text-blue-600">{interestRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm font-bold mb-2 dark:text-slate-300">
                    <span>
                      {t`Tenure`} (
                      {t`English` === "English" ? "Years" : "ஆண்டுகள்"})
                    </span>
                    <span className="text-blue-600">
                      {tenure} {t`Years`}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-slate-800/50 rounded-3xl p-6 flex flex-col justify-center space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t`Monthly EMI`}</p>
                  <p className="text-3xl font-black text-blue-600">
                    ₹{Math.round(emiDetails.monthlyEmi).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t dark:border-slate-700 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t`Total Interest`}</p>
                    <p className="font-bold dark:text-white">
                      ₹{Math.round(emiDetails.totalInterest).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t`Total Payment`}</p>
                    <p className="font-bold dark:text-white">
                      ₹{Math.round(emiDetails.totalPayment).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR (Price & Visit Request) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">{t`Asking Price`}</p>
              <h2 className="text-4xl md:text-5xl font-black text-blue-600 mb-8">
                ₹{property.price.toLocaleString()}
              </h2>
              <button
                onClick={() => navigate("/contact")}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition mb-6"
              >{t`Contact Agent`}</button>
              <div className="pt-8 border-t dark:border-slate-800">
                <h3 className="text-xl font-black mb-6 dark:text-white">{t`Schedule a Visit`}</h3>
                <form onSubmit={handleRequestVisit} className="space-y-4">
                  <input
                    type="text"
                    value={user?.user?.name || ""}
                    readOnly
                    placeholder={t`Full Name`}
                    className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:opacity-90 transition"
                  >{t`Request Visit`}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon, label, value }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm">
      <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded-xl text-white">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
          {label}
        </p>
        <p className="font-black text-slate-800 dark:text-slate-200 text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}
