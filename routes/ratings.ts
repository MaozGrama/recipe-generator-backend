import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router();

router.post("/ratings", async (req, res) => {
  console.log("Rating request received:", req.body);
  const { recipeTitle, rating } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });
  if (!recipeTitle || rating === undefined || rating < 1 || rating > 5) {
    console.log("Validation failed:", { recipeTitle, rating }); // Debug
    return res.status(400).json({ error: "Valid recipeTitle and rating (1-5) are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingRatingIndex = user.ratings.findIndex((r) => r.recipeTitle === recipeTitle);
    if (existingRatingIndex >= 0) {
      user.ratings[existingRatingIndex].rating = rating;
    } else {
      user.ratings.push({ recipeTitle, rating });
    }
    await user.save();
    console.log("User ratings after save:", user.ratings); // Debug

    res.json({ success: true, rating });
  } catch (err) {
    console.error("Rating error:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to set rating" });
    }
  }
});

router.get("/ratings/average", async (req, res) => {
  const { recipeTitle } = req.query;

  if (!recipeTitle || typeof recipeTitle !== "string") {
    return res.status(400).json({ error: "recipeTitle is required" });
  }

  try {
    const users = await User.find({ "ratings.recipeTitle": recipeTitle });
    if (users.length === 0) {
      return res.json({ averageRating: null });
    }

    const totalRatings = users.reduce((sum, user) => {
      const rating = user.ratings.find((r) => r.recipeTitle === recipeTitle)?.rating || 0;
      return sum + rating;
    }, 0);
    const averageRating = totalRatings / users.length;

    res.json({ averageRating: Number(averageRating.toFixed(1)) }); // Round to 1 decimal place
  } catch (err) {
    console.error("Average rating error:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to calculate average rating" });
    }
  }
});

export default router;