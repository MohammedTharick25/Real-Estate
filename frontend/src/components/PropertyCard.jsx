import { MapPin, Maximize, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function PropertyCard({ property }) {
  useLingui();
  const { user, updateWishlist } = useAuth();

  const isFavorite = user?.user?.favorites?.includes(property._id);

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Stop navigation to details page
    if (!user) return alert(t`Account created! Please login.`);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/favorites/toggle`,
        {
          userId: user.user.id,
          propertyId: property._id,
        },
      );
      updateWishlist(res.data.favorites);
    } catch (err) {
      console.error(err);
    }
  };

  const image =
    property?.images?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl transition-all group relative">
      {/* Wishlist Heart Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <Heart
          size={20}
          fill={isFavorite ? "#ef4444" : "none"}
          className={
            isFavorite ? "text-red-500" : "text-slate-600 dark:text-slate-300"
          }
        />
      </button>

      <Link to={`/property/${property?._id}`}>
        <div className="overflow-hidden">
          <img
            src={image}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Property"
          />
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">
            {property?.title || t`New Property`}
          </h3>
          <p className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1">
            <MapPin size={16} className="mr-1 text-blue-600" />
            {property?.location || t`Location`}
          </p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-blue-600 font-bold text-lg">
              {typeof property?.price === "number"
                ? `₹${property.price.toLocaleString()}`
                : t`Asking Price`}
            </span>
            {property?.size && (
              <span className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                <Maximize size={16} className="mr-1" /> {property.size}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
