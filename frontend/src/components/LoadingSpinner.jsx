import { motion } from "framer-motion";

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div
      className={`${fullScreen ? "h-screen w-screen" : "h-64"} flex flex-col items-center justify-center`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full"
      />
      <p className="mt-4 text-slate-500 font-medium animate-pulse">
        Processing media and details...
      </p>
    </div>
  );
}
