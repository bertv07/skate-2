import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); // Hacer el fondo transparente
renderer.setSize(70 * 26, 40 * 16); // Ajustar el tamaño según los rems
document.getElementById('skate-viewer').appendChild(renderer.domElement);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 1, 5).normalize();
scene.add(light);

// Luz ambiente adicional
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Luces adicionales
const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.set(50, 50, 50);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-50, -50, -50);
scene.add(pointLight2);

// Asegúrate de que GLTFLoader esté disponible globalmente
const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/models/skate.glb', function (gltf) {
  const skate = gltf.scene;

  // Aplicar la textura por defecto
  const loader = new THREE.TextureLoader();
  const skateTexture = loader.load('assets/textures/texture.avif');
  skate.traverse(function (node) {
    if (node.isMesh) {
      node.material.map = skateTexture;
      node.material.needsUpdate = true;
    }
  });

  scene.add(skate);

  // Animación con GSAP
  gsap.to(skate.rotation, { y: 20});
  gsap.to(skate.rotation, { x: 13.1});
  gsap.to(skate.rotation, { z: 6});

  // Renderizar la escena
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Seleccionar color de la paleta
  const colorBoxes = document.querySelectorAll('.color-box');
  colorBoxes.forEach((colorBox) => {
    colorBox.addEventListener('click', () => {
      const color = colorBox.style.backgroundColor; // Obtener el color seleccionado
      skate.traverse(function (node) {
        if (node.isMesh) {
          node.material.color.set(color);
          node.material.needsUpdate = true;
        }
      });
    });
  });

  // Cambiar textura
  document.getElementById('texture-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const skateTexture = loader.load(event.target.result);
      skate.traverse(function (node) {
        if (node.isMesh) {
          node.material.map = skateTexture;
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
    skate.traverse(function (node) {
      if (node.isMesh && node.material) {
        if (!deckColor) {
          deckColor = node.material.color.getHexString(); // Obtener el color actual en formato hexadecimal
        }
        if (!textureUrl && node.material.map) {
          textureUrl = node.material.map.image.currentSrc; // Obtener la URL de la textura
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
          alert('Error guardando el diseño.', err);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    reader.readAsDataURL(textureFile);
  });
}, undefined, function (error) {
  console.error(error);
});

camera.position.z = 400;
camera.position.y = 100;
camera.position.x = 350;

// CSS para el div .cart
const style = document.createElement('style');
style.innerHTML = `
  .cart {
    width: 45rem;
    border-radius:4rem;
    height: 50rem;
    margin-left:8rem;
  }
  #skate-viewer canvas {
    width: 100%;
    height: 100%;
  }
`;
document.head.appendChild(style);
