const { MongoClient } = require("mongodb");

// La URI para conectar a MongoDB (servidor local en el puerto 27017)
const uri = "mongodb://127.0.0.1:27017/skateboards"; // Cambia el nombre de la base de datos si lo deseas

// Crear un cliente de MongoDB
const client = new MongoClient(uri);

let db; // Esta variable almacenará la base de datos una vez que se conecte

// Función para conectar con MongoDB
async function connectDB() {
  if (db) return db; // Si ya estamos conectados, devolvemos la conexión activa
  try {
    await client.connect(); // Conectar al cliente de MongoDB
    db = client.db(); // Obtener la base de datos por defecto
    console.log("Conexión a MongoDB establecida");
    return db; // Devolvemos la base de datos para usarla en otros archivos
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1); // Si hay un error, terminamos la ejecución
  }
}

module.exports = connectDB; // Exportamos la función para usarla en otros archivos
