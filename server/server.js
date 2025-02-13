const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Aumentar límite de tamaño
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Conexión a MongoDB Atlas
const mongoUrl = 'mongodb+srv://gleybertmartinez0702:V07020207@cluster0.lukcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error conectando a MongoDB Atlas:', err));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal para servir principal.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/principal.html'));
});

// Ruta para manejar el guardado de diseños
app.post('/api/designs', async (req, res) => {
  const { deckColor, textureUrl } = req.body;

  try {
    // Aquí puedes guardar el diseño en la base de datos
    // Por ejemplo, usando Mongoose:
    // const newDesign = new SkateDesign({ deckColor, textureUrl });
    // await newDesign.save();

    res.status(201).json({ message: 'Diseño guardado correctamente' });
  } catch (err) {
    console.error('Error guardando el diseño:', err);
    res.status(500).json({ error: 'Error guardando el diseño' });
  }
});

// Ruta para obtener los diseños guardados
app.get('/api/designs', async (req, res) => {
  try {
    // Aquí puedes obtener los diseños desde la base de datos
    // Por ejemplo, usando Mongoose:
    // const designs = await SkateDesign.find();
    const designs = []; // Esto es un ejemplo, reemplázalo con la lógica real

    res.status(200).json(designs);
  } catch (err) {
    console.error('Error obteniendo los diseños:', err);
    res.status(500).json({ error: 'Error obteniendo los diseños' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});