// backend/routes/auth.ts
import express from "express";

const router = express.Router();

// Example route (adjust based on your implementation)
router.post("/login", (req, res) => {
  res.json({ message: "Auth endpoint" });
});

export default router;