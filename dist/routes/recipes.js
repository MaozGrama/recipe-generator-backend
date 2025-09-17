"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAIHelper_1 = require("../utils/googleAIHelper");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    let { pantryItems } = req.body;
    const isRandom = req.query.random === 'true';
    if (isRandom) {
        const allIngredients = ['חלב', 'קמח', 'ביצים', 'סוכר', 'שמן', 'מלח', 'פלפל', 'עגבניות'];
        pantryItems = allIngredients.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 2);
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
exports.default = router;
