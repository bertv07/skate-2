// Obtener diseños desde el backend
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
  
        // Cargar textura
        const loader = new THREE.TextureLoader();
        const texture = loader.load(design.textureUrl);
  
        // Crear skate
        const geometry = new THREE.BoxGeometry(3, 0.5, 8);
        const material = new THREE.MeshPhongMaterial({ map: texture, color: design.deckColor });
        const skate = new THREE.Mesh(geometry, material);
        scene.add(skate);
  
        camera.position.z = 10;
  
        // Animación
        function animate() {
          requestAnimationFrame(animate);
          skate.rotation.y += 0.01;
          renderer.render(scene, camera);
        }
        animate();
  
        // Botones para editar y eliminar
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => openEditModal(design._id, design.deckColor));
  
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => deleteDesign(design._id));
  
        designItem.appendChild(editButton);
        designItem.appendChild(deleteButton);
  
        container.appendChild(designItem);
      });
    }
  
    // Abrir modal para editar diseño
    function openEditModal(id, currentColor) {
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
            body: JSON.stringify({ deckColor: newColor, textureUrl: newTextureUrl }),
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