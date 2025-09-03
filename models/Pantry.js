const mongoose = require("mongoose");

const PantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ingredient: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pantry", PantrySchema);
