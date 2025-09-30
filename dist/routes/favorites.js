"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        res.json({ favorites: user?.favorites || [] });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});
router.post("/", auth_1.authMiddleware, async (req, res) => {
    const recipe = req.body;
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        return res.status(400).json({ error: "Invalid recipe" });
    }
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        user.favorites.push(recipe);
        await user.save();
        res.json({ message: "Recipe added to favorites" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add favorite" });
    }
});
router.delete("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const { title } = req.body;
        if (!title)
            return res.status(400).json({ error: "Title is required" });
        user.favorites = user.favorites.filter((r) => r.title !== title);
        await user.save();
        console.log(`Deleted favorite: ${title} for user ${user._id}`); // Debug
        res.json({ message: "Recipe removed from favorites" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to remove favorite" });
    }
});
exports.default = router;
