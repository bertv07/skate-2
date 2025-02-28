import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  let currentDesignId = null; // Almacena el ID del diseño que se está editando

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

  // Renderizar diseños con opciones de editar y eliminar
  function renderDesigns(designs) {
    const container = document.getElementById('designs-container');
    container.innerHTML = ''; // Limpiar contenedor

    designs.forEach((design, index) => {
      const designItem = document.createElement('div');
      designItem.className = 'design-item';

      // Alternar colores de las tarjetas
      designItem.style.backgroundColor = index % 2 === 0 ? '#9c00f9' : '#f6c006'; // Morado y amarillo alternados

      const canvas = document.createElement('canvas');
      designItem.appendChild(canvas);

      // Configuración de Three.js para la miniatura
      const miniScene = new THREE.Scene();
      const miniCamera = new THREE.PerspectiveCamera(75, 370 / 450, 0.1, 1000); // Relación de aspecto 370x450
      const miniRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true, // Fondo transparente
      });
      miniRenderer.setSize(370, 450); // Tamaño del canvas

      // Luz para la miniatura
      const miniLight = new THREE.DirectionalLight(0xffffff, 1);
      miniLight.position.set(5, 5, 5).normalize();
      miniScene.add(miniLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      miniScene.add(ambientLight);

      // Cargar el modelo GLTF para cada diseño
      const gltfLoader = new GLTFLoader();
      const textureLoader = new THREE.TextureLoader();

      gltfLoader.load('assets/models/skate.glb', function (gltf) {
        const skate = gltf.scene;

        // Aplicar textura y color al modelo
        const texture = textureLoader.load(design.textureUrl);
        skate.traverse((node) => {
          if (node.isMesh && node.material.name === 'tabla') { // Aplicar solo a la tabla
            node.material.map = texture;
            node.material.color.set(design.deckColor); // Usar el color de la base de datos
            node.material.needsUpdate = true;
          }
        });

        // Ajustar la posición inicial del skateboard
        skate.position.set(0, 0, 0);

        // Crear un grupo para contener el modelo y permitir múltiples rotaciones
        const group = new THREE.Group();
        group.add(skate);
        miniScene.add(group);

        // Configurar la cámara
        miniCamera.position.set(-120, 400, 300); // Posición de la cámara
        miniCamera.lookAt(10, 0, 0); // Apuntar la cámara al centro del modelo

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
      }, undefined, (error) => {
        console.error('Error cargando el modelo:', error);
      });

      // Botones para editar y eliminar
      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.className = 'edit-button'; // Clase para el botón de editar
      editButton.addEventListener('click', () => openEditModal(design._id, design.deckColor, design.textureUrl));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';
      deleteButton.className = 'delete-button'; // Clase para el botón de eliminar
      deleteButton.addEventListener('click', () => deleteDesign(design._id));

      designItem.appendChild(editButton);
      designItem.appendChild(deleteButton);

      container.appendChild(designItem);
    });
  }

  // Abrir modal para editar diseño
  function openEditModal(id, currentColor, currentTextureUrl) {
    currentDesignId = id; // Guardar el ID del diseño
    document.getElementById('edit-deck-color').value = currentColor; // Establecer el color actual
    document.getElementById('edit-texture-file').value = ''; // Limpiar el campo de archivo
    document.getElementById('modal-overlay').classList.add('open');
    document.getElementById('edit-modal').classList.add('open');
  }

  // Cerrar modal
  function closeEditModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('edit-modal').classList.remove('open');
  }

  // Guardar cambios al editar
  async function saveEdit() {
    const newColor = document.getElementById('edit-deck-color').value;
    const newTextureFile = document.getElementById('edit-texture-file').files[0];

    if (!newTextureFile) {
      alert('Por favor, sube una nueva textura.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const newTextureUrl = event.target.result;

      try {
        const response = await fetch(`/api/designs/${currentDesignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deckColor: newColor, textureUrl: newTextureUrl }), // Actualizar color y textura
        });

        if (response.ok) {
          alert('Diseño actualizado correctamente');
          fetchDesigns(); // Recargar diseños
          closeEditModal(); // Cerrar modal
        } else {
          alert('Error actualizando el diseño');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    reader.readAsDataURL(newTextureFile);
  }

  // Eliminar diseño
  async function deleteDesign(id) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este diseño?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/designs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Diseño eliminado correctamente');
        fetchDesigns(); // Recargar diseños
      } else {
        alert('Error eliminando el diseño');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  // Event listeners para el modal
  document.getElementById('save-edit').addEventListener('click', saveEdit);
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

  // Cargar diseños al iniciar la página
  fetchDesigns();
});