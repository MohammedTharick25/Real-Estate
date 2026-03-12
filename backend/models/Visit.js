// backend/models/Visit.js
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    phone: String,
    status: {
      type: String,
      enum: ["pending", "scheduled", "visited", "cancelled"],
      default: "pending",
    },
    feedback: {
      rating: Number,
      comment: String,
      submittedAt: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visit", visitSchema);
