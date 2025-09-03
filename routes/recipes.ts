import { Router } from 'express';
import { generateRecipes } from '../utils/googleAIHelper';

const router = Router();

router.post('/', async (req, res) => {
  const { pantryItems } = req.body;
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

export default router;
