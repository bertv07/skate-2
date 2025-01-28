import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Design from './models/design.js'; // Asegúrate de agregar la extensión .js

// URL proporcionada por MongoDB Atlas
const MONGO_URI = 'mongodb+srv://gleybertmartinez0702:V07020207@cluster0.lukcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Conectar a MongoDB Atlas
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

// Directorio público
const publicDir = path.join(process.cwd(), 'public');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`Petición recibida: ${pathname}`);

  // Rutas para los archivos estáticos (HTML, CSS, JS)
  if (pathname === '/') {
    serveStaticFile('index.html', res);
  } else if (pathname === '/crear') {
    serveStaticFile('crear.html', res);
  } else if (pathname === '/ver') {
    serveStaticFile('ver.html', res);
  } else if (pathname.startsWith('/assets/')) {
    serveStaticFile(pathname.substring(1), res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404: Recurso no encontrado</h1>');
  }
});

// Función para servir archivos estáticos
function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath);
  const contentTypeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
  };
  const contentType = contentTypeMap[ext] || 'application/octet-stream';

  fs.readFile(path.join(publicDir, filePath), (err, data) => {
    if (err) {
      console.error(`Error al leer el archivo: ${filePath}`, err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Archivo no encontrado');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// Iniciar el servidor
server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
