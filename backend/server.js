const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const listingRoutes = require("./routes/listingRoutes");

const app = express();
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
const visitRoutes = require("./routes/visitRoutes");
app.use("/api/visits", visitRoutes);

app.post("/api/inquiry", async (req, res) => {
  try {
    const Inquiry = require("./models/Inquiry");
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(200).json({ message: "Inquiry sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
