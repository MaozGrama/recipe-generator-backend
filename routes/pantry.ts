// backend/routes/pantry.ts
import express from "express";

const router = express.Router();

// Example route (adjust based on your implementation)
router.get("/", (req, res) => {
  res.json({ pantryItems: [] });
});

export default router;