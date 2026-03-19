const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings");
const Visit = require("../models/Visit");

router.get("/stats", async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments();
    const totalVisits = await Visit.countDocuments();
    const viewsAgg = await Listing.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Fixed Inventory Value Aggregation to ensure we always have "Sold" and "Available" labels
    const inventoryData = await Listing.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly Visit Trends (Existing logic is good)
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
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const visitMap = {};
    visitData.forEach((v) => {
      visitMap[v._id] = v.count;
    });
    const visitTrends = months.map((m, i) => ({
      _id: m,
      count: visitMap[i + 1] || 0,
    }));

    const topProperties = await Listing.find()
      .sort({ views: -1 })
      .limit(6)
      .select("title views price status");

    // KPI Calculations
    const soldListings = await Listing.find({ status: "Sold" });
    let soldValue = 0;
    let revenue = 0;
    soldListings.forEach((p) => {
      soldValue += p.price || 0;
      revenue += (p.price * (p.commission || 0)) / 100;
    });

    const ratings = await Visit.aggregate([
      { $match: { "feedback.rating": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$feedback.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.json({
      kpis: {
        totalListings,
        totalVisits,
        totalViews,
        conversionRate:
          totalViews > 0 ? ((totalVisits / totalViews) * 100).toFixed(2) : 0,
        soldValue,
        revenue,
        avgRating: ratings[0]?.avgRating
          ? parseFloat(ratings[0].avgRating.toFixed(1))
          : 0,
        reviewCount: ratings[0]?.totalReviews || 0,
      },
      inventoryValue: inventoryData, // Array of {_id: "Sold"/"Available", total: 1000}
      visitTrends,
      topProperties,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
