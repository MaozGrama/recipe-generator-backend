const Pantry = require("../models/Pantry");

// GET user pantry
exports.getPantry = async (req, res) => {
  try {
    const pantry = await Pantry.find({ userId: req.params.userId });
    res.json(pantry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD item
exports.addItem = async (req, res) => {
  try {
    const newItem = new Pantry(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE item
exports.updateItem = async (req, res) => {
  try {
    const updated = await Pantry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE item
exports.deleteItem = async (req, res) => {
  try {
    await Pantry.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
