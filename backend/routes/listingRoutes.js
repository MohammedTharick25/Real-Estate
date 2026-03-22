const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings"); // Ensure this matches your filename
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const Visit = require("../models/Visit"); // Import Visit model for cleanup on delete
const { sendPropertyAlert } = require("../utils/emailService"); // Import the email service function
const User = require("../models/User");

// CREATE Listing (Consolidated & Fixed)
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 2 },
  ]),
  async (req, res) => {
    try {
      const imageUrls = req.files?.images
        ? req.files.images.map((f) => f.path)
        : [];

      const videoUrls = req.files?.videos
        ? req.files.videos.map((f) => f.path)
        : [];

      const newListing = new Listing({
        ...req.body,
        price: Number(req.body.price),
        images: imageUrls,
        videos: videoUrls,
        commission: Number(req.body.commission || 0),
        latitude: Number(req.body.latitude), // Add this
        longitude: Number(req.body.longitude),
        amenities: Array.isArray(req.body.amenities)
          ? req.body.amenities
          : req.body.amenities
            ? [req.body.amenities]
            : [],
      });

      const savedListing = await newListing.save();

      // 🚀 WORLD CLASS FEATURE: Dispatch Emails in background
      // We don't use 'await' here so the Admin doesn't have to wait for emails to send
      User.find({ isBlocked: false }).then((users) => {
        console.log(`📧 Dispatching API emails to ${users.length} users...`);
        sendPropertyAlert(users, savedListing)
          .then(() => console.log("✅ API Dispatch Complete"))
          .catch((err) => console.error("❌ API Error:", err));
      });

      res.status(201).json(savedListing);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// Toggle Status (Sold/Available)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Listings with Advanced Filtering
router.get("/", async (req, res) => {
  try {
    const {
      location,
      type,
      minPrice,
      maxPrice,
      status,
      sort,
      lat,
      lng,
      radius,
    } = req.query;

    let query = {};

    // 1. PRICE RANGE FILTER
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 2. RADIUS SEARCH (Geospatial)
    // Formula: 1 degree of lat is ~111km.
    // We filter using a bounding box approach for simplicity or $geoWithin if using Point.
    // Using numeric range here since your schema uses separate lat/lng fields:
    if (lat && lng && radius) {
      const r = Number(radius); // km
      const ky = 40000 / 360;
      const kx = Math.cos((Math.PI * lat) / 180.0) * ky;
      const dx = r / kx;
      const dy = r / ky;

      query.latitude = { $gte: Number(lat) - dy, $lte: Number(lat) + dy };
      query.longitude = { $gte: Number(lng) - dx, $lte: Number(lng) + dx };
    }
    // 3. TEXT LOCATION FILTER (Only if radius search isn't active)
    else if (location && location.trim() !== "") {
      query.location = {
        $regex: location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    // 4. PROPERTY TYPE
    if (type) query.propertyType = type;

    // 5. SORTING
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };

    const listings = await Listing.find(query).sort(sortOption);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single Property
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ message: "Property not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increment view count
router.patch("/:id/view", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ message: "View incremented" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (!listing.likes) listing.likes = [];

    const alreadyLiked = listing.likes.includes(userId);

    if (alreadyLiked) {
      listing.likes = listing.likes.filter((id) => id.toString() !== userId);
    } else {
      listing.likes.push(userId);
    }

    await listing.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: listing.likes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Property
router.delete("/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);

    await Visit.deleteMany({ propertyId: req.params.id });

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
