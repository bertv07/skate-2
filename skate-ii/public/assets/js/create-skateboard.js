import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import * as BufferGeometryUtils from './BufferGeometryUtils.js';

// Configuración de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Carga del modelo 3D
const loader = new GLTFLoader();
loader.load(
  './models/skateboard.glb', // Asegúrate de que esta ruta sea correcta
  (gltf) => {
    scene.add(gltf.scene);
    animate();
  },
  undefined,
  (error) => {
    console.error('Error al cargar el modelo:', error);
  }
);

// Animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

camera.position.z = 5;
