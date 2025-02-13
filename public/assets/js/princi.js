// Importar Three.js y módulos necesarios
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuración de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 2, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true para fondo transparente
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz principal
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(1, 1, 1);
scene.add(light);

// Luz ambiente adicional
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

// Luces adicionales
const pointLight1 = new THREE.PointLight(0xffffff, 5);
pointLight1.position.set(50, 50, 50);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 5);
pointLight2.position.set(-50, -50, -50);
scene.add(pointLight2);

// Cargar el modelo GLTF
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

let skates = [];

// Función para cargar un skate en un contenedor específico
function loadSkate(containerId, textureUrl, deckColor) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contenedor ${containerId} no encontrado.`);
    return;
  }

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  
  const localScene = new THREE.Scene();
  const localCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  localCamera.position.set(150, 300, 250);
  localCamera.lookAt(20,20,20);

  gltfLoader.load('assets/models/skate.glb', function (gltf) {
    const skate = gltf.scene;

    // Aplicar la textura y el color
    const texture = textureLoader.load(textureUrl);
    skate.traverse(function (node) {
      if (node.isMesh) {
        node.material.map = texture;
        node.material.color.set(deckColor);
        node.material.needsUpdate = true;
      }
    });

    localScene.add(skate);
    skates.push(skate);

    // Animación
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(localScene, localCamera);
    }
    animate();
  });
}


// Cargar skates en los contenedores
loadSkate('skate3d-1', 'assets/textures/texture.avif', '#ff0000'); // Rojo
loadSkate('skate3d-2', 'assets/textures/texture2.jpg', '#00ff00'); // Verde
loadSkate('skate3d-3', 'assets/textures/texture3.jpg', '#0000ff'); // Azul
