import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicializar loaders
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Función para cargar skates aleatorios desde la base de datos
async function loadRandomSkaters() {
  try {
    console.log("Cargando skates aleatorios desde la API...");

    // Obtener los diseños desde la API
    const response = await fetch('/api/designs');
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const designs = await response.json();
    console.log("Diseños cargados:", designs);

    if (!designs || designs.length === 0) {
      console.log("No hay diseños disponibles");
      return;
    }

    // Cargar un skate aleatorio en cada contenedor
    loadRandomSkate('skate3d-1', designs);
    loadRandomSkate('skate3d-2', designs);
    loadRandomSkate('skate3d-3', designs);
  } catch (error) {
    console.error("Error al cargar los skates aleatorios:", error);
  }
}

// Función para cargar un skate aleatorio en un contenedor específico
function loadRandomSkate(containerId, designs) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contenedor ${containerId} no encontrado.`);
    return;
  }

  // Limpiar el contenedor
  container.innerHTML = '';

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const miniRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  miniRenderer.setSize(container.clientWidth, container.clientHeight);

  const miniScene = new THREE.Scene();
  const miniCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);

  // Posición de la cámara
  miniCamera.position.set(-120, 400, 300); // Posición de la cámara
  miniCamera.lookAt(10, 0, 0); // Apuntar la cámara al centro del modelo

  // Añadir luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  miniScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  miniScene.add(directionalLight);

  // Seleccionar un diseño aleatorio
  const randomDesign = designs[Math.floor(Math.random() * designs.length)];
  console.log(`Skate aleatorio seleccionado para ${containerId}:`, randomDesign);

  // Cargar el modelo GLTF
  gltfLoader.load('assets/models/skate.glb', function (gltf) {
    const skate = gltf.scene;

    // Aplicar la textura y el color
    const texture = textureLoader.load(randomDesign.textureUrl);
    skate.traverse(function (node) {
      if (node.isMesh && node.material.name === 'tabla') {
        node.material.map = texture;
        node.material.color.set(new THREE.Color(randomDesign.deckColor));
        node.material.needsUpdate = true;
      }
    });

    // Crear un grupo para contener el modelo y permitir múltiples rotaciones
    const group = new THREE.Group();
    group.add(skate);
    miniScene.add(group);

    // Variables para la animación
    let time = 0;
    const speed = 0.01;

    // Función de animación
    const animateMiniSkate = () => {
      requestAnimationFrame(animateMiniSkate);

      time += speed;

      // Rotar el grupo (y por ende el skateboard) en múltiples ejes
      group.rotation.z = -time; // Rotación en Z (balanceo)

      miniRenderer.render(miniScene, miniCamera);
    };

    // Iniciar animación
    animateMiniSkate();
  });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadRandomSkaters);