const mongoose = require('mongoose');

const skateDesignSchema = new mongoose.Schema({
  deckColor: { type: String, required: true }, // Color del deck en formato hexadecimal
  textureUrl: { type: String, required: true }, // URL de la textura
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
});

// Forzar el nombre de la colección a "skateDesigns"
module.exports = mongoose.model('SkateDesign', skateDesignSchema, 'skateDesigns');