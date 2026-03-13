const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  propertyType: {
    type: String,
    enum: ["Land", "House", "Apartment"],
    required: true,
  },
  status: { type: String, enum: ["Available", "Sold"], default: "Available" },
  images: [{ type: String }], // Cloudinary URLs
  videos: [{ type: String }],
  amenities: [String],
  latitude: { type: Number, required: true, default: 13.0827 }, // Default to Chennai
  longitude: { type: Number, required: true, default: 80.2707 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", listingSchema);
