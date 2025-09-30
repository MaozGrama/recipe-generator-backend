"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleAIHelper_1 = require("../utils/googleAIHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    let { pantryItems } = req.body;
    const isRandom = req.query.random === "true";
    if (isRandom) {
        const allIngredients = ["חלב", "קמח", "ביצים", "סוכר", "שמן", "מלח", "פלפל", "עגבניות"];
        pantryItems = allIngredients
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 2); // Random subset of 2-4 ingredients
    }
    if (!Array.isArray(pantryItems) || pantryItems.length === 0) {
        return res.status(400).json({ success: false, error: "Please provide pantry items" });
    }
    try {
        const recipes = await (0, googleAIHelper_1.generateRecipes)(pantryItems);
        res.json({ success: true, recipes });
    }
    catch (err) {
        res.status(500).json({ success: false, error: "Failed to generate recipes" });
    }
});
router.get("/random", async (req, res) => {
    const countQuery = req.query.count;
    const count = typeof countQuery === "string" ? parseInt(countQuery) : 3; // Type guard
    try {
        const allIngredients = ["חלב", "קמח", "ביצים", "סוכר", "שמן", "מלח", "פלפל", "עגבניות"];
        const randomIngredientsSets = Array.from({ length: count }, () => allIngredients
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 ingredients per recipe
        );
        const recipes = await Promise.all(randomIngredientsSets.map(googleAIHelper_1.generateRecipes));
        const flattenedRecipes = recipes.flat();
        res.json({ success: true, recipes: flattenedRecipes.slice(0, count) });
    }
    catch (err) {
        res.status(500).json({ success: false, error: "Failed to generate random recipes" });
    }
});
router.post("/shopping-list", async (req, res) => {
    const { pantryItems, recipeTitles, additionalItems = [] } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Shopping list request received:", { pantryItems, recipeTitles, additionalItems, token });
    if (!token)
        return res.status(401).json({ error: "No token provided" });
    if (!Array.isArray(pantryItems) || !Array.isArray(recipeTitles) || !Array.isArray(additionalItems)) {
        return res.status(400).json({ error: "pantryItems, recipeTitles, and additionalItems must be arrays" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User_1.default.findById(decoded.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Corrected logic: Directly filter the user's favorites
        const favoriteRecipes = user.favorites || [];
        let recipeIngredients = favoriteRecipes
            .filter((r) => recipeTitles.includes(r.title))
            .flatMap((r) => r.ingredients);
        // If no matching favorites, use generated recipes as fallback
        if (recipeIngredients.length === 0) {
            console.log("No matching favorites found, using generated recipes as fallback");
            const generatedRecipes = await (0, googleAIHelper_1.generateRecipes)(pantryItems);
            recipeIngredients = generatedRecipes
                .filter((r) => recipeTitles.includes(r.title))
                .flatMap((r) => r.ingredients);
        }
        console.log("Recipe ingredients:", recipeIngredients);
        // Create shopping list from recipeIngredients and additionalItems with explicit types
        const availableItemsSet = new Set(pantryItems.map((item) => item.trim().toLowerCase()));
        const shoppingList = {
            ...recipeIngredients
                .filter((ingredient) => !availableItemsSet.has(ingredient.trim().toLowerCase()))
                .reduce((list, item) => {
                list[item] = (list[item] || 0) + 1;
                return list;
            }, {}),
            ...additionalItems
                .filter((item) => !availableItemsSet.has(item.trim().toLowerCase()))
                .reduce((list, item) => {
                list[item] = (list[item] || 0) + 1;
                return list;
            }, {}),
        };
        console.log("Generated shopping list:", shoppingList);
        res.json({ shoppingList });
    }
    catch (err) {
        console.error("Shopping list error:", err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: "Failed to generate shopping list" });
        }
    }
});
exports.default = router;
