const express = require('express');
const skateController = require('./controllers/skateController');

const router = express.Router();

// Guardar diseño
router.post('/designs', skateController.saveDesign);

// Obtener diseños
router.get('/designs', skateController.getDesigns);

// Eliminar diseño
router.delete('/designs/:id', skateController.deleteDesign);

// Editar diseño
router.put('/designs/:id', skateController.updateDesign);

module.exports = router;