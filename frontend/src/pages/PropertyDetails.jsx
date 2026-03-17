import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Ruler,
  Building,
  ArrowLeft,
  Share2,
  Heart,
  ShieldCheck,
  Calculator,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function PropertyDetails() {
  useLingui();
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [phone, setPhone] = useState("");
  const [liked, setLiked] = useState(false);
  const { user, updateWishlist } = useAuth();

  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  useEffect(() => {
    // Fetch Property Data
    axios
      .get(`http://localhost:5000/api/listings/${id}`)
      .then((res) => {
        setProperty(res.data);
        setLoanAmount(res.data.price);
        setLoading(false);
        setLiked(res.data.liked || false);
      })
      .catch((err) => console.error(err));

    // View Incrementer (Runs only once)
    if (!viewTracked.current) {
      viewTracked.current = true;

      const sessionKey = `v_${id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        axios
          .patch(`http://localhost:5000/api/listings/${id}/view`)
          .then(() => sessionStorage.setItem(sessionKey, "true"))
          .catch((err) => console.error("Analytics Error:", err));
      }
    }
  }, [id]);

  const isFavorite = user?.user?.favorites?.includes(property?._id);

  const toggleFavorite = async () => {
    if (!user) return alert(t`Account created! Please login.`);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/favorites/toggle",
        {
          userId: user.user?.id,
          propertyId: property?._id,
        },
      );

      updateWishlist(res.data.favorites);
    } catch (err) {
      console.error(err);
    }
  };

  const viewTracked = useRef(false);

  const emiDetails = useMemo(() => {
    const P = loanAmount;
    const R = interestRate / 12 / 100;
    const N = tenure * 12;
    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    return {
      monthlyEmi: emiCalc || 0,
      totalInterest: emiCalc * N - P || 0,
      totalPayment: emiCalc * N || 0,
    };
  }, [loanAmount, interestRate, tenure]);

  const handleRequestVisit = async (e) => {
    e.preventDefault();
    if (!user)
      return toast.error(t`Please login to request a visit.`, { icon: "🔒" });
    if (!phone) return toast.error(t`Please enter your mobile number.`);

    try {
      await axios.post("http://localhost:5000/api/visits", {
        propertyId: id,
        userId: user.user.id,
        name: user.user.name,
        email: user.user.email,
        phone: phone,
      });
      toast.success(t`Visit request sent! We will contact you soon.`, {
        duration: 6000,
        icon: "📅",
        style: { border: "2px solid #2563eb", padding: "16px" },
      });
      setPhone("");
    } catch (err) {
      toast.error(t`Failed to send visit request, Try again`, { icon: "❌" });
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
      className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors"
    >
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex justify-between items-center z-10">
              <button
                onClick={() => setShowAllPhotos(false)}
                className="p-2 rounded-full hover:bg-slate-100"
              >
                <ArrowLeft />
              </button>
              <h2 className="font-bold">
                {t`Media`} ({mediaList.length})
              </h2>
              <div className="w-10" />
            </div>
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {mediaList.map((m, i) =>
                i === 0 && property.videos?.[0] ? (
                  <video
                    key={i}
                    src={m}
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full rounded-2xl"
                  />
                ) : (
                  <img key={i} src={m} className="w-full rounded-2xl" alt="" />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} /> {t`Back`}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigator.share
                ? navigator.share({
                    title: property.title,
                    url: window.location.href,
                  })
                : navigator.clipboard.writeText(window.location.href)
            }
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={toggleFavorite}
            className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg transition hover:scale-110"
          >
            <Heart
              size={22}
              fill={isFavorite ? "#ef4444" : "none"}
              className={
                isFavorite
                  ? "text-red-500"
                  : "text-slate-600 dark:text-slate-300"
              }
            />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto md:px-4 mb-8">
        <div
          className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-3xl overflow-hidden shadow-lg relative cursor-pointer"
          onClick={() => setShowAllPhotos(true)}
        >
          {mediaList.slice(0, 5).map((m, i) => (
            <div
              key={i}
              className={`overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              {i === 0 && property.videos?.[0] ? (
                <video
                  key={i}
                  src={m}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full rounded-2xl"
                />
              ) : (
                <img
                  src={m}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  alt=""
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              {property.title}
            </h1>
            <p className="flex items-center text-slate-500">
              <MapPin size={20} className="mr-2 text-blue-600" />{" "}
              {property.location}
            </p>
          </div>

          <div className="flex gap-4 py-6 border-y dark:border-slate-800 mb-8 overflow-x-auto">
            <Feature icon={<Ruler />} label={t`Size`} value={property.size} />
            <Feature
              icon={<Building />}
              label={t`Type`}
              value={property.propertyType}
            />
            <Feature
              icon={<ShieldCheck className="text-green-500" />}
              label={t`Status`}
              value={t`Verified`}
            />
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-black text-blue-600 mb-4">{t`Description`}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {property.amenities?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-black text-blue-600 mb-4">
                {t`Amenities`}
              </h3>

              <div className="flex flex-wrap gap-3">
                {property.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 border dark:border-slate-700 text-sm font-bold rounded-xl"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Calculator className="text-blue-600" /> {t`EMI Calculator`}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Slider
                  label={t`Loan Amount`}
                  value={loanAmount}
                  min={100000}
                  max={property.price * 1.2}
                  step={50000}
                  onChange={setLoanAmount}
                  prefix="₹"
                />
                <Slider
                  label={t`Interest Rate`}
                  value={interestRate}
                  min={5}
                  max={18}
                  step={0.1}
                  onChange={setInterestRate}
                  suffix="%"
                />
                <Slider
                  label={t`Tenure (Years)`}
                  value={tenure}
                  min={1}
                  max={30}
                  step={1}
                  onChange={setTenure}
                />
              </div>
              <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-3xl flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 uppercase">{t`Monthly EMI`}</p>
                <p className="text-4xl font-black text-blue-600">
                  ₹{Math.round(emiDetails.monthlyEmi).toLocaleString()}
                </p>
                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-between text-sm font-bold">
                  <span className="text-slate-500">{t`Total Interest`}</span>
                  <span className="dark:text-white">
                    ₹{Math.round(emiDetails.totalInterest).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t`Price`}</p>
            <h2 className="text-4xl font-black text-blue-600 mb-8">
              ₹{property.price.toLocaleString()}
            </h2>
            <form onSubmit={handleRequestVisit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t`Email`}</label>
                <input
                  type="text"
                  value={user?.user?.email || ""}
                  readOnly
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t`Mobile Number`}</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:shadow-xl transition-all"
              >{t`Request Visit`}</button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex-shrink-0">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">
          {label}
        </p>
        <p className="font-black text-slate-800 dark:text-white text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix = "",
  suffix = "",
}) {
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className="text-slate-500">{label}</span>
        <span className="text-blue-600">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}
