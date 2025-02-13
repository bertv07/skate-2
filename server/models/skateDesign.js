const mongoose = require('mongoose');

const skateDesignSchema = new mongoose.Schema({
  deckColor: { type: String, required: true },
  textureUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SkateDesign', skateDesignSchema);