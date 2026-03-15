const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings");
const Visit = require("../models/Visit");
const mongoose = require("mongoose");

router.get("/stats", async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments();
    const totalVisits = await Visit.countDocuments();

    const viewsAgg = await Listing.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Inventory Value
    const inventoryValue = await Listing.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$price" },
        },
      },
    ]);

    // Monthly visit trends
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const visitData = await Visit.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const visitMap = {};
    visitData.forEach((v) => {
      visitMap[v._id] = v.count;
    });

    const visitTrends = months.map((m, i) => ({
      _id: m,
      count: visitMap[i + 1] || 0,
    }));

    // Top performing properties
    const topProperties = await Listing.find()
      .sort({ views: -1 })
      .limit(6)
      .select("title views price");

    // Conversion rate (important for real estate)
    const conversionRate =
      totalViews > 0 ? ((totalVisits / totalViews) * 100).toFixed(2) : 0;

    res.json({
      kpis: {
        totalListings,
        totalVisits,
        totalViews,
        conversionRate,
      },
      inventoryValue,
      visitTrends,
      topProperties,
      avgRating: 4.5,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
