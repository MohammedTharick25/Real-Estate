const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");

// USER: Submit Request Visit
router.post("/", async (req, res) => {
  try {
    const { propertyId, userId, name, email, phone, message } = req.body;
    const newVisit = new Visit({
      propertyId,
      userId,
      name,
      email,
      phone,
      message, // optional
    });
    await newVisit.save();
    res.status(201).json(newVisit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Get all visits (populated with property title)
router.get("/admin", async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate("propertyId", "title location")
      .sort({ createdAt: -1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Update Status (pending -> scheduled -> visited)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Visit.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USER: Get my visits
router.get("/user/:userId", async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.params.userId }).populate(
      "propertyId",
      "title images",
    );
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USER: Submit Feedback
router.patch("/:id/feedback", async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updated = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        feedback: { rating, comment, submittedAt: new Date() },
      },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
