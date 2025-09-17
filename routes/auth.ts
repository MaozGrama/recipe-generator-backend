import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router();

router.post("/signup", async (req, res) => {
  console.log("Signup request received:", req.body);
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "Email, password, and username are required" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, username, favorites: [], ratings: [] });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "2h" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Signup error:", (err as Error).stack); // Type assertion to Error
    if ((err as Error).name === "ValidationError") {
      return res.status(400).json({ error: (err as Error).message });
    }
    res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "2h" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", (err as Error).stack);
    res.status(500).json({ error: (err as Error).message || "Failed to log in" });
  }
});

router.post("/ratings", async (req, res) => {
  console.log("Rating request received:", req.body);
  const { recipeTitle, rating } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });
  if (!recipeTitle || rating === undefined || rating < 1 || rating > 5) {
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

    res.json({ success: true, rating, ratings: user.ratings });
  } catch (err) {
    console.error("Rating error:", (err as Error).stack);
    if ((err as Error).name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: (err as Error).message || "Failed to set rating" });
  }
});

export default router;