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
      message,
    });
    await newVisit.save();

    // NOTIFY ALL ADMINS
    const io = req.app.get("io");
    io.to("admins").emit("admin_notification", {
      message: `New visit request from ${name}`,
      type: "new_visit",
      visitId: newVisit._id,
    });

    res.status(201).json(newVisit);
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

    // NOTIFY THE SPECIFIC USER ONLY
    const io = req.app.get("io");
    // We emit to the room named after the userId
    io.to(updated.userId.toString()).emit("user_notification", {
      message: `Your visit status has been updated to: ${status}`,
      status: status,
    });

    res.json(updated);
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

// USER: Get my visits
router.get("/user/:userId", async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.params.userId })
      .populate({
        path: "propertyId",
        select: "title location images",
      })
      .sort({ createdAt: -1 });

    const filteredVisits = visits.filter((v) => v.propertyId !== null);

    res.json(filteredVisits);
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
