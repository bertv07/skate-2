import * as THREE from './assets/js/three.module.js';
import { GLTFLoader } from './assets/js/GLTFLoader.js';





// Crear la escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('skateboard-container').appendChild(renderer.domElement);

const loader = new GLTFLoader();
let skateboardModel;

// Función para cambiar el color del skateboard
function changeColor(color) {
  if (skateboardModel) {
    skateboardModel.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(color);
      }
    });
  }
}

// Animación
const animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Cargar el modelo 3D del skateboard
loader.load('assets/models/skateboard.glb', (gltf) => {
  skateboardModel = gltf.scene;
  scene.add(skateboardModel);
  animate();
});

camera.position.z = 5;

// Detectar cambios en el color picker
document.getElementById('colorPicker').addEventListener('input', (event) => {
  changeColor(event.target.value);
});
