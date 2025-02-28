const SkateDesign = require('../models/skateDesign.js'); // Importar el modelo

// Guardar un diseño
exports.saveDesign = async (req, res) => {
  const { deckColor, textureUrl } = req.body;

  try {
    const newDesign = new SkateDesign({ deckColor, textureUrl });
    await newDesign.save();
    console.log('Diseño guardado:', newDesign);
    res.status(201).json({ message: 'Diseño guardado correctamente', design: newDesign });
  } catch (err) {
    console.error('Error guardando el diseño:', err);
    res.status(500).json({ error: 'Error guardando el diseño' });
  }
};

// Obtener todos los diseños
exports.getDesigns = async (req, res) => {
  try {
    const designs = await SkateDesign.find().sort({ createdAt: -1 });
    console.log('Diseños obtenidos:', designs);
    res.status(200).json(designs);
  } catch (err) {
    console.error('Error obteniendo los diseños:', err);
    res.status(500).json({ error: 'Error obteniendo los diseños' });
  }
};

// Eliminar un diseño
exports.deleteDesign = async (req, res) => {
  const { id } = req.params;

  try {
    await SkateDesign.findByIdAndDelete(id);
    res.status(200).json({ message: 'Diseño eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando el diseño:', err);
    res.status(500).json({ error: 'Error eliminando el diseño' });
  }
};

// Editar un diseño
exports.updateDesign = async (req, res) => {
  const { id } = req.params;
  const { deckColor, textureUrl } = req.body;

  try {
    const updatedDesign = await SkateDesign.findByIdAndUpdate(
      id,
      { deckColor, textureUrl },
      { new: true }
    );
    res.status(200).json({ message: 'Diseño actualizado correctamente', design: updatedDesign });
  } catch (err) {
    console.error('Error actualizando el diseño:', err);
    res.status(500).json({ error: 'Error actualizando el diseño' });
  }
};