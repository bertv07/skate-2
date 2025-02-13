const SkateDesign = require('../models/skateDesign');

// Guardar diseño
exports.saveDesign = async (req, res) => {
  const { deckColor, textureUrl } = req.body;

  try {
    const newDesign = new SkateDesign({ deckColor, textureUrl });
    await newDesign.save();
    res.status(201).json(newDesign);
  } catch (err) {
    res.status(500).json({ error: 'Error guardando el diseño' });
  }
};

// Obtener diseños
exports.getDesigns = async (req, res) => {
  try {
    const designs = await SkateDesign.find().sort({ createdAt: -1 });
    res.status(200).json(designs);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo los diseños' });
  }
};

// Eliminar diseño
exports.deleteDesign = async (req, res) => {
  const { id } = req.params;

  try {
    await SkateDesign.findByIdAndDelete(id);
    res.status(200).json({ message: 'Diseño eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando el diseño' });
  }
};

// Editar diseño
exports.updateDesign = async (req, res) => {
  const { id } = req.params;
  const { deckColor, textureUrl } = req.body;

  try {
    const updatedDesign = await SkateDesign.findByIdAndUpdate(
      id,
      { deckColor, textureUrl },
      { new: true } // Devuelve el diseño actualizado
    );
    res.status(200).json(updatedDesign);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando el diseño' });
  }
};