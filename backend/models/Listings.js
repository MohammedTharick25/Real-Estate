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
  images: [{ type: String }],
  videos: [{ type: String }],
  amenities: [String],
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commission: { type: Number, default: 0 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ADD THIS: Index for Geospatial search
listingSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("Listing", listingSchema);
