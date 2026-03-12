import { useEffect, useState } from "react";
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
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import { t } from "@lingui/macro";
import { useRef } from "react";

export default function PropertyDetails() {
  const form = useRef();

  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/listings/${id}`)
      .then((res) => {
        setProperty(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!property)
    return <p className="text-center py-20">{t`Property not found`}</p>;

  const mediaList = [
    ...(property.videos?.[0] ? [property.videos[0]] : []),
    ...(property.images || []),
  ];

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAIL_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY,
      )
      .then(
        () => {
          alert(t`Message sent successfully!`);
          form.current.reset();
        },
        (error) => {
          alert(t`Failed to send message`);
          console.error(error);
        },
      );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-black min-h-screen pb-24 md:pb-12 transition-colors"
    >
      {/* PHOTO / VIDEO MODAL */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-blue-100 dark:border-slate-800 z-10">
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
                    alt={`${t`Media`} ${i}`}
                  />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
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

      {/* GALLERY */}
      <div className="max-w-7xl mx-auto md:px-4 mb-8">
        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory relative h-[300px]">
          {mediaList.map((media, i) =>
            i === 0 && property.videos?.[0] ? (
              <div key={i} className="min-w-full h-full snap-start relative">
                <video
                  src={media}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            ) : (
              <div key={i} className="min-w-full h-full snap-start relative">
                <img
                  src={media}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ),
          )}

          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Grid size={14} /> {t`View All`}
          </button>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-3xl overflow-hidden shadow-lg relative">
          {mediaList.slice(0, 5).map((media, i) => (
            <div
              key={i}
              className={`overflow-hidden group cursor-pointer ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              onClick={() => setShowAllPhotos(true)}
            >
              {i === 0 && property.videos?.[0] ? (
                <video
                  src={media}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={media}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={`${t`Media`} ${i}`}
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

      {/* DETAILS SECTION */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {property.propertyType}
              </span>

              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                  property.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {property.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
              {property.title}
            </h1>

            <p className="flex items-center text-slate-500 dark:text-slate-400 text-lg">
              <MapPin size={20} className="mr-2 text-blue-600" />
              {property.location}
            </p>
          </div>

          {/* FEATURES */}
          <div className="flex gap-4 py-8 border-y border-blue-100 dark:border-slate-800 mb-10 overflow-x-auto">
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
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {t`The Property`}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line">
              {property.description}
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl dark:shadow-black/30">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">{t`Asking Price`}</p>

              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                ₹{property.price.toLocaleString()}
              </h2>

              <div className="space-y-4 mb-10">
                <button
                  onClick={() => navigate("/contact")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition"
                >
                  {t`Contact Agent`}
                </button>
              </div>

              {/* Schedule a visit */}
              <div className="pt-8 border-t border-blue-100 dark:border-slate-800">
                <h3 className="text-xl font-black mb-6 dark:text-white">{t`Schedule a Visit`}</h3>

                <form ref={form} onSubmit={sendEmail} className="space-y-4">
                  <input
                    type="text"
                    placeholder={t`Full Name`}
                    className="w-full p-4 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none"
                  />

                  <textarea
                    placeholder={t`Your Message...`}
                    className="w-full p-4 bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none h-24"
                  />

                  <button
                    type="button"
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:opacity-90 transition"
                  >
                    {t`Request Visit`}
                  </button>
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
    <div className="flex-shrink-0 flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-xl text-white">
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
