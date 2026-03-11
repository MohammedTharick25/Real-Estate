import { MapPin, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function PropertyCard({ property }) {
  // Ensure the card re-renders on language change
  useLingui();

  const image =
    property?.images?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";

  const priceLabel =
    typeof property?.price === "number"
      ? `₹${property.price.toLocaleString()}`
      : t`Asking Price`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl dark:shadow-black/30 transition-all duration-300 group">
      {/* Image */}
      <div className="overflow-hidden">
        <img
          src={image}
          alt={property?.title || t`New Property`}
          loading="lazy"
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">
          {property?.title || t`New Property`}
        </h3>

        <p className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1">
          <MapPin size={16} className="mr-1 text-blue-600" />
          {t`${property?.location}` || t`${Location}`}
        </p>

        {/* Price + Size */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-blue-600 font-bold text-lg">{priceLabel}</span>

          {property?.size && (
            <span className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
              <Maximize size={16} className="mr-1" />
              {property.size}
            </span>
          )}
        </div>

        {/* Button */}
        <Link
          to={`/property/${property?._id}`}
          className="block text-center mt-4 bg-slate-900 dark:bg-blue-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
        >
          {t`View All`}
        </Link>
      </div>
    </div>
  );
}
