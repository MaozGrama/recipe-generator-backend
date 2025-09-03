"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/pantry.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Example route (adjust based on your implementation)
router.get("/", (req, res) => {
    res.json({ pantryItems: [] });
});
exports.default = router;
