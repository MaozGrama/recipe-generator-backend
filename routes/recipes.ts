import { Router } from "express";
import { generateRecipes } from "../utils/googleAIHelper";
import jwt from "jsonwebtoken";
import User, { Recipe } from "../models/User";

const router = Router();

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
    const recipes = await generateRecipes(pantryItems);
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate recipes" });
  }
});

router.get("/random", async (req, res) => {
  const countQuery = req.query.count;
  const count = typeof countQuery === "string" ? parseInt(countQuery) : 3; // Type guard
  try {
    const allIngredients = ["חלב", "קמח", "ביצים", "סוכר", "שמן", "מלח", "פלפל", "עגבניות"];
    const randomIngredientsSets = Array.from({ length: count }, () =>
      allIngredients
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 ingredients per recipe
    );

    const recipes = await Promise.all(randomIngredientsSets.map(generateRecipes));
    const flattenedRecipes = recipes.flat();
    res.json({ success: true, recipes: flattenedRecipes.slice(0, count) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate random recipes" });
  }
});

router.post("/shopping-list", async (req, res) => {
  const { pantryItems, recipeTitles, additionalItems = [] } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  console.log("Shopping list request received:", { pantryItems, recipeTitles, additionalItems, token });

  if (!token) return res.status(401).json({ error: "No token provided" });
  if (!Array.isArray(pantryItems) || !Array.isArray(recipeTitles) || !Array.isArray(additionalItems)) {
    return res.status(400).json({ error: "pantryItems, recipeTitles, and additionalItems must be arrays" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Corrected logic: Directly filter the user's favorites
    const favoriteRecipes = user.favorites || [];
    let recipeIngredients = favoriteRecipes
      .filter((r: Recipe) => recipeTitles.includes(r.title))
      .flatMap((r: Recipe) => r.ingredients);

    // If no matching favorites, use generated recipes as fallback
    if (recipeIngredients.length === 0) {
      console.log("No matching favorites found, using generated recipes as fallback");
      const generatedRecipes = await generateRecipes(pantryItems);
      recipeIngredients = generatedRecipes
        .filter((r) => recipeTitles.includes(r.title))
        .flatMap((r) => r.ingredients);
    }
    console.log("Recipe ingredients:", recipeIngredients);

    // Create shopping list from recipeIngredients and additionalItems with explicit types
    const availableItemsSet = new Set(pantryItems.map((item) => item.trim().toLowerCase()));
    const shoppingList = {
      ...recipeIngredients
        .filter((ingredient: string) => !availableItemsSet.has(ingredient.trim().toLowerCase()))
        .reduce((list: { [key: string]: number }, item: string) => {
          list[item] = (list[item] || 0) + 1;
          return list;
        }, {}),
      ...additionalItems
        .filter((item: string) => !availableItemsSet.has(item.trim().toLowerCase()))
        .reduce((list: { [key: string]: number }, item: string) => {
          list[item] = (list[item] || 0) + 1;
          return list;
        }, {}),
    };

    console.log("Generated shopping list:", shoppingList);
    res.json({ shoppingList });
  } catch (err) {
    console.error("Shopping list error:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to generate shopping list" });
    }
  }
});

export default router;