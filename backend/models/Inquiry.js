const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
