const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { storage } = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage });

router.put("/update", upload.single("image"), async (req, res) => {
  try {
    const { name, email, id } = req.body;

    console.log("Updating User ID:", id); // DEBUG 1
    console.log("New Name:", name); // DEBUG 2

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "User ID is missing or invalid" });
    }

    let updateData = { name, email };

    if (req.file) {
      console.log("New File Uploaded:", req.file.path); // DEBUG 3
      updateData.image = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.status(200).json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
      },
      message: "Profile updated successfully!",
    });
  } catch (err) {
    console.error("CRASH ERROR:", err); // THIS WILL TELL YOU WHY IT IS A 500 ERROR
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
