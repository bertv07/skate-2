const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes'); // Importar routes.js (está al lado de server.js)

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Conexión a MongoDB Atlas
const mongoUrl = 'mongodb+srv://gleybertmartinez0702:V07020207@cluster0.lukcq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB Atlas:', err));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, '../public')));

// Ruta principal para servir principal.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/principal.html'));
});

// Usar las rutas definidas en routes.js
app.use('/api', routes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});