const { generateRecipe } = require("../utils/googleAIHelper");
const Pantry = require("../models/Pantry");

exports.generateRecipeFromPantry = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch pantry ingredients for this user
    const pantry = await Pantry.find({ userId });
    const ingredientList = pantry.map(item => `${item.quantity || ""} ${item.unit || ""} ${item.ingredient}`);

    if (ingredientList.length === 0) {
      return res.status(400).json({ error: "No ingredients in pantry" });
    }

    const recipe = await generateRecipe(ingredientList);
    res.json({ recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
