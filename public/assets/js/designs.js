// Importar Three.js y módulos necesarios
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Obtener diseños desde el backend
async function fetchDesigns() {
  try {
    const response = await fetch('/api/designs');
    if (!response.ok) {
      throw new Error('Error obteniendo los diseños');
    }
    const designs = await response.json();
    renderDesigns(designs);
  } catch (err) {
    console.error('Error:', err);
  }
}

// Renderizar diseños en 3D
function renderDesigns(designs) {
  const container = document.getElementById('designs-container');
  if (!container) {
    console.error('El contenedor de diseños no fue encontrado.');
    return;
  }

  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  designs.forEach((design) => {
    const designItem = document.createElement('div');
    designItem.className = 'design-item';

    const canvas = document.createElement('canvas');
    designItem.appendChild(canvas);

    // Configuración de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(200, 200);

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Cargar el modelo GLTF
    gltfLoader.load('assets/models/skate.glb', function (gltf) {
      const skate = gltf.scene;

      // Aplicar la textura
      const texture = textureLoader.load(design.textureUrl);
      skate.traverse(function (node) {
        if (node.isMesh) {
          node.material.map = texture;
          node.material.color.set(design.deckColor);
          node.material.needsUpdate = true;
        }
      });

      scene.add(skate);

      // Animación
      function animate() {
        requestAnimationFrame(animate);
        skate.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    });

    container.appendChild(designItem);
  });
}

// Cargar diseños al iniciar la página
fetchDesigns();