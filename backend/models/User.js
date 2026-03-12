const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // You will change this to 'admin' manually in DB
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
