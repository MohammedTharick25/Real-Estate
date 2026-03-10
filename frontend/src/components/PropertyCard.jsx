import { MapPin, Maximize } from "lucide-react";
import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  const image =
    property?.images?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";

  const price =
    typeof property?.price === "number"
      ? `₹${property.price.toLocaleString()}`
      : "Price on request";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl dark:shadow-black/30 transition-all duration-300 group">
      {/* Image */}
      <div className="overflow-hidden">
        <img
          src={image}
          alt={property?.title || "Property"}
          loading="lazy"
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">
          {property?.title || "Untitled Property"}
        </h3>

        <p className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1">
          <MapPin size={16} className="mr-1 text-brand" />
          {property?.location || "Location unavailable"}
        </p>

        {/* Price + Size */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-brand font-bold text-lg">{price}</span>

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
          className="block text-center mt-4 bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-950 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
