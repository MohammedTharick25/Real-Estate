import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  FileText,
  Download,
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
      .get(`${import.meta.env.VITE_API_URL}/api/listings/${id}`)
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
          .patch(`${import.meta.env.VITE_API_URL}/api/listings/${id}/view`)
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
        `${import.meta.env.VITE_API_URL}/api/users/favorites/toggle`,
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/visits`, {
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

  // Helper to convert image URL to Base64 (Essential for jsPDF)
  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const downloadBrochure = async () => {
    const toastId = toast.loading(t`Generating high-quality brochure...`);
    try {
      const doc = new jsPDF();
      const brandColor = [37, 99, 235]; // #2563eb

      // --- 1. HEADER & BRANDING ---
      doc.setFillColor(...brandColor);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ESTATERA", 15, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("PREMIUM REAL ESTATE BROCHURE", 15, 33);
      doc.text(new Date().toLocaleDateString(), 180, 25, { align: "right" });

      // --- 2. MAIN IMAGE ---
      if (property.images?.[0]) {
        try {
          const imgData = await getBase64ImageFromURL(property.images[0]);
          // Aspect ratio calculation to fit width
          const imgWidth = 180;
          const imgHeight = 100;
          doc.addImage(
            imgData,
            "PNG",
            15,
            50,
            imgWidth,
            imgHeight,
            undefined,
            "FAST",
          );
        } catch (e) {
          console.error("Image PDF error", e);
        }
      }

      // --- 3. PROPERTY TITLE & PRICE ---
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(property.title, 15, 165);

      doc.setTextColor(...brandColor);
      doc.setFontSize(18);
      doc.text(`INR ${property.price.toLocaleString()}`, 15, 175);

      // --- 4. KEY DETAILS TABLE ---
      autoTable(doc, {
        startY: 185,
        head: [[t`Location`, t`Property Type`, t`Size`]],
        body: [[property.location, property.propertyType, property.size]],
        theme: "plain",
        headStyles: {
          textColor: [100, 100, 100],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 11, textColor: [0, 0, 0], fontStyle: "bold" },
        margin: { left: 15 },
      });

      // --- 5. DESCRIPTION ---
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(t`DESCRIPTION`, 15, doc.lastAutoTable.finalY + 10);

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      const splitDesc = doc.splitTextToSize(property.description, 180);
      doc.text(splitDesc, 15, doc.lastAutoTable.finalY + 17);

      // --- 6. AMENITIES ---
      if (property.amenities?.length > 0) {
        const yPos = doc.lastAutoTable.finalY + 50;
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(t`\n\nPREMIUM AMENITIES\n`, 15, yPos);

        doc.setTextColor(...brandColor);
        doc.text(t`\n\n${property.amenities.join("  •  ")}\n`, 15, yPos + 7);
      }

      // --- 7. FOOTER ---
      doc.setDrawColor(230, 230, 230);
      doc.line(15, 275, 195, 275);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        t`Contact us at support@estatera@gmail.com for more information regarding this property.`,
        105,
        282,
        { align: "center" },
      );

      doc.save(`${property.title.replace(/\s+/g, "_")}_Brochure.pdf`);
      toast.success(t`Brochure downloaded!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(t`Failed to generate PDF`, { id: toastId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors"
    >
      {/* 1. FULL SCREEN OVERLAY (Shows only when clicking an image) */}
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
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft />
              </button>
              <h2 className="font-bold dark:text-white">
                {t`Media`} ({mediaList.length})
              </h2>
              <div className="w-10" />
            </div>
            {/* Simple vertical list for "View All" mode */}
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {mediaList.map((m, i) =>
                i === 0 && property.videos?.[0] ? (
                  <video
                    key={i}
                    src={m}
                    controls
                    className="w-full rounded-2xl"
                  />
                ) : (
                  <img key={i} src={m} className="w-full rounded-2xl" alt="" />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TOP NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} /> {t`Back`}
        </button>
        <div className="flex gap-2">
          <button
            onClick={downloadBrochure}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-full shadow-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-all font-bold text-sm"
          >
            <FileText size={18} className="text-blue-600" />
            <span className="hidden md:inline">{t`Brochure`}</span>
          </button>

          <button
            onClick={() =>
              navigator.share
                ? navigator.share({
                    title: property.title,
                    url: window.location.href,
                  })
                : navigator.clipboard.writeText(window.location.href)
            }
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"
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

      {/* 3. MAIN MEDIA GALLERY (FIXED HERE) */}
      <div className="max-w-7xl mx-auto md:px-4 mb-8">
        {/* 📱 MOBILE VIEW: Horizontal Swipe Gallery (Visible on Mobile Only) */}
        <div className="block md:hidden px-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-2">
            {mediaList.map((m, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[85vw] aspect-[4/3] rounded-3xl overflow-hidden snap-center shadow-lg border dark:border-slate-800 relative"
                onClick={() => setShowAllPhotos(true)}
              >
                {i === 0 && property.videos?.[0] ? (
                  <video
                    src={m}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={m} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold">
                  {i + 1} / {mediaList.length}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest animate-pulse">
            {t`Swipe to explore`}
          </p>
        </div>

        {/* 💻 DESKTOP VIEW: Bento Grid (Visible on Desktop Only) */}
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
                  src={m}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
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
          <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 dark:text-white">
            <ShieldCheck size={18} className="text-blue-600" />
            {t`View All Media`}
          </div>
        </div>
      </div>

      {/* 4. CONTENT GRID (Details & Sidebar) */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Title and stats */}
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

          {/* Amenities and EMI Calculator... (rest of your code remains the same) */}
          {property.amenities?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-black text-blue-600 mb-4">{t`Amenities`}</h3>
              <div className="flex flex-wrap gap-3">
                {property.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 border dark:border-slate-700 text-sm font-bold rounded-xl dark:text-white"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white">
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

        {/* SIDEBAR FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t`Price`}</p>
            <h2 className="text-4xl font-black text-blue-600 mb-8">
              ₹{property.price.toLocaleString()}
            </h2>
            <form onSubmit={handleRequestVisit} className="space-y-4">
              {/* Form fields... (your existing code) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t`Email`}</label>
                <input
                  type="text"
                  value={user?.user?.email || ""}
                  readOnly
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t`Mobile Number`}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all"
                >{t`Request Visit`}</button>
                <button
                  type="button"
                  onClick={downloadBrochure}
                  className="w-full flex items-center justify-center gap-2 border-2 border-blue-600/10 text-blue-600 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all"
                >
                  <FileText size={20} /> {t`Download Brochure`}
                </button>
              </div>
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
