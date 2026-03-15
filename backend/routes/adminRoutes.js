const express = require("express");
const router = express.Router();
const Listing = require("../models/Listings");
const Visit = require("../models/Visit");

router.get("/stats", async (req, res) => {
  try {
    // BASIC KPIs
    const totalListings = await Listing.countDocuments();
    const totalVisits = await Visit.countDocuments();

    const viewsAgg = await Listing.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalViews = viewsAgg[0]?.totalViews || 0;

    // INVENTORY VALUE (Available vs Sold)
    const inventoryValue = await Listing.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$price" },
        },
      },
    ]);

    // MONTHLY VISIT TRENDS
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

    // TOP PERFORMING PROPERTIES
    const topProperties = await Listing.find()
      .sort({ views: -1 })
      .limit(6)
      .select("title views price");

    // CONVERSION RATE
    const conversionRate =
      totalViews > 0 ? ((totalVisits / totalViews) * 100).toFixed(2) : 0;

    // SOLD VALUE + COMMISSION REVENUE
    const soldListings = await Listing.find({ status: "Sold" });

    let soldValue = 0;
    let revenue = 0;

    soldListings.forEach((p) => {
      soldValue += p.price || 0;
      revenue += (p.price * (p.commission || 0)) / 100;
    });

    res.json({
      kpis: {
        totalListings,
        totalVisits,
        totalViews,
        conversionRate,
        soldValue,
        revenue,
      },
      inventoryValue,
      visitTrends,
      topProperties,
      avgRating: 4.5,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
