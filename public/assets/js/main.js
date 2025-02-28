import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuración de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); // Fondo transparente
renderer.setSize(40 * 33, 35 * 16); // Tamaño ajustado en rems
document.getElementById('skate-viewer').appendChild(renderer.domElement);

// Luces
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 1, 5).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.set(50, 50, 50);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-50, -50, -50);
scene.add(pointLight2);

// Cargar el modelo GLTF
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
let skate; // Variable global para el modelo del skate

gltfLoader.load('assets/models/skate.glb', function (gltf) {
  skate = gltf.scene;

  // Aplicar textura por defecto
  const skateTexture = textureLoader.load('assets/textures/texture.avif');
  skate.traverse((node) => {
    if (node.isMesh && node.material.name === 'tabla') { // Solo aplicar a la tabla
      node.material.map = skateTexture;
      node.material.needsUpdate = true;
    }
  });

  scene.add(skate);
  console.log("Modelo cargado:", skate);

  // Animación con GSAP
  gsap.to(skate.rotation, { y: 20, duration: 2 });
  gsap.to(skate.rotation, { x: 13.1, duration: 2 });
  gsap.to(skate.rotation, { z: 6, duration: 2 });

  // Función para aplicar color al modelo
  const applyColor = (color) => {
    skate.traverse((node) => {
      if (node.isMesh && node.material.name === 'tabla') { // Solo aplicar a la tabla
        node.material.color.set(color);
        node.material.needsUpdate = true;
      }
    });
  };

  // Seleccionar color de la paleta
  const colorBoxes = document.querySelectorAll('.color-box');
  colorBoxes.forEach((colorBox) => {
    colorBox.addEventListener('click', () => {
      const color = colorBox.style.backgroundColor;
      applyColor(color);
    });
  });

  // Seleccionar color del input de color
  const colorInput = document.getElementById('color');
  colorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    applyColor(color);
  });

  // Cambiar textura
  document.getElementById('texture-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newTexture = textureLoader.load(event.target.result);
      skate.traverse((node) => {
        if (node.isMesh && node.material.name === 'tabla') { // Solo aplicar a la tabla
          node.material.map = newTexture;
          node.material.needsUpdate = true;
        }
      });
    };
    reader.readAsDataURL(file);
  });

  // Guardar diseño
  document.getElementById('save-design').addEventListener('click', async () => {
    let deckColor = null;
    let textureUrl = null;

    // Obtener el color y la textura del modelo
    skate.traverse((node) => {
      if (node.isMesh && node.material.name === 'tabla') {
        if (!deckColor) {
          deckColor = `#${node.material.color.getHexString()}`; // Color en hexadecimal con #
        }
        if (!textureUrl && node.material.map) {
          textureUrl = node.material.map.image.currentSrc; // URL de la textura
        }
      }
    });

    const textureFile = document.getElementById('texture-file').files[0];
    if (!textureFile) {
      alert('Por favor, sube una textura.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      textureUrl = event.target.result;

      try {
        const response = await fetch('/api/designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deckColor, textureUrl }),
        });

        if (response.ok) {
          alert('Diseño guardado correctamente.');
        } else {
          alert('Error guardando el diseño.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error guardando el diseño.');
      }
    };
    reader.readAsDataURL(textureFile);
  });

  // Posición de la cámara
  camera.position.set(350, 100, 400);

  // Animación y renderizado
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}, undefined, (error) => {
  console.error('Error cargando el modelo:', error);
});