import { Router } from "express";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth";
import { Recipe } from "../models/User";

const router = Router();

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ favorites: user?.favorites || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

router.post("/", authMiddleware, async (req: any, res) => {
  const recipe: Recipe = req.body;
  if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
    return res.status(400).json({ error: "Invalid recipe" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.favorites.push(recipe);
    await user.save();
    res.json({ message: "Recipe added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/", authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    user.favorites = user.favorites.filter((r: Recipe) => r.title !== title);
    await user.save();
    console.log(`Deleted favorite: ${title} for user ${user._id}`); // Debug
    res.json({ message: "Recipe removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;