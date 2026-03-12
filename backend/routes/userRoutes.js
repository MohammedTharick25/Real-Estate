const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { storage } = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage });

// 1. UPDATE PROFILE (Existing)
router.put("/update", upload.single("image"), async (req, res) => {
  try {
    const { name, email, id } = req.body;
    if (!id || id === "undefined")
      return res.status(400).json({ error: "User ID missing" });

    let updateData = { name, email };
    if (req.file) updateData.image = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(200).json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        favorites: updatedUser.favorites, // Include favorites in response
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. TOGGLE FAVORITE (NEW - Fixes the 404 POST error)
router.post("/favorites/toggle", async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isFavorite = user.favorites.includes(propertyId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== propertyId,
      );
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();
    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET USER FAVORITES (NEW - Fixes the 404 GET error)
router.get("/favorites/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("favorites");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
