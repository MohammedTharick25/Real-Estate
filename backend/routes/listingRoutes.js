const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings"); // Ensure this matches your filename
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

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
      });

      await newListing.save();
      res.status(201).json(newListing);
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

// GET All Listings
router.get("/", async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, status, amenities, sort } =
      req.query;

    let query = {};

    // LOCATION filter (partial match, escape special regex chars)
    if (location && location.trim() !== "") {
      const escaped = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.location = { $regex: escaped, $options: "i" };
    }

    // PROPERTY TYPE filter (partial match)
    if (type && type.trim() !== "") {
      const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.propertyType = { $regex: escapedType, $options: "i" };
    }

    // STATUS filter
    if (status) query.status = status;

    // PRICE RANGE filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // AMENITIES filter
    if (amenities) {
      const amenitiesArray = amenities.split(",");
      query.amenities = { $in: amenitiesArray };
    }

    // SORTING
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "size") sortOption = { size: -1 };

    const listings = await Listing.find(query).sort(sortOption);
    res.json(listings);
  } catch (err) {
    console.error(err);
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

// DELETE Property
router.delete("/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
