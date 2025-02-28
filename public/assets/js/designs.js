import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

// Inicializar loaders
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

class InfiniteCarousel {
  constructor(config) {
    // Configuración básica
    this.container = config.container
    this.items = config.items || []
    this.autoplaySpeed = config.autoplaySpeed || 5000
    this.transitionSpeed = config.transitionSpeed || 500
    this.activeIndex = 0
    this.isAnimating = false

    // Elementos del DOM
    this.carouselWrapper = null
    this.itemElements = []
    this.visibleItems = {
      left: null,
      center: null,
      right: null,
    }

    // Controles
    this.prevButton = null
    this.nextButton = null

    // Inicializar
    this.init()
  }

  init() {
    console.log("Inicializando carrusel con", this.items.length, "elementos")

    // Verificar si hay elementos
    if (!this.items || this.items.length === 0) {
      this.container.innerHTML = '<div class="carousel-empty">No hay elementos para mostrar</div>'
      return
    }

    // Crear estructura del carrusel
    this.createCarouselStructure()

    // Crear elementos iniciales
    this.createItems()

    // Configurar controles
    this.setupControls()

    // Iniciar autoplay
    this.startAutoplay()

    console.log("Carrusel inicializado correctamente")
  }

  createCarouselStructure() {
    // Limpiar el contenedor
    this.container.innerHTML = ""

    // Crear wrapper
    this.carouselWrapper = document.createElement("div")
    this.carouselWrapper.className = "carousel-wrapper"
    this.container.appendChild(this.carouselWrapper)

    // Crear contenedor de items
    this.itemsContainer = document.createElement("div")
    this.itemsContainer.className = "carousel-items"
    this.carouselWrapper.appendChild(this.itemsContainer)

    // Crear botones de navegación
    this.prevButton = document.createElement("button")
    this.prevButton.className = "carousel-control carousel-control-prev"
    this.prevButton.innerHTML = "&lt;"
    this.carouselWrapper.appendChild(this.prevButton)

    this.nextButton = document.createElement("button")
    this.nextButton.className = "carousel-control carousel-control-next"
    this.nextButton.innerHTML = "&gt;"
    this.carouselWrapper.appendChild(this.nextButton)
  }

  createItems() {
    // Asegurarse de que haya al menos 3 elementos (duplicar si es necesario)
    if (this.items.length < 3) {
      const originalItems = [...this.items]
      while (this.items.length < 3) {
        this.items = [...this.items, ...originalItems]
      }
    }

    // Crear todos los elementos del carrusel
    this.items.forEach((item, index) => {
      const itemElement = this.createItemElement(item, index)
      this.itemElements.push(itemElement)
      this.itemsContainer.appendChild(itemElement)
    })

    // Posicionar elementos iniciales
    this.positionItems()
  }

  createItemElement(item, index) {
    const itemElement = document.createElement("div")
    itemElement.className = "carousel-item"
    itemElement.dataset.index = index

    // Crear contenedor para el modelo 3D
    const modelContainer = document.createElement("div")
    modelContainer.className = "model-container"
    itemElement.appendChild(modelContainer)

    // Cargar el modelo 3D
    this.loadModel(modelContainer, item)

    return itemElement
  }

  async loadModel(container, item) {
    try {
      // Crear renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(container.clientWidth || 500, container.clientHeight || 500)
      container.appendChild(renderer.domElement)

      // Crear escena
      const scene = new THREE.Scene()

      // Crear cámara
      const camera = new THREE.PerspectiveCamera(
        75,
        (container.clientWidth || 600) / (container.clientHeight || 800),
        0.2,
        999,
      )

      // Ajustar la posición de la cámara para ver el skateboard desde un ángulo
      camera.position.set(-100, 300, 300)
      camera.lookAt(10, 0, 0)

      // Añadir luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(1, 1, 1)
      scene.add(directionalLight)

      // Cargar modelo
      const gltf = await gltfLoader.loadAsync("assets/models/skate.glb")
      const model = gltf.scene

      // Aplicar textura si existe
      if (item.textureUrl) {
        const texture = await textureLoader.loadAsync(item.textureUrl)
        model.traverse((node) => {
          if (node.isMesh && node.material.name === "tabla") {
            node.material.map = texture
            node.material.needsUpdate = true
          }
        })
      }

      // Aplicar color de la base de datos
      model.traverse((node) => {
        if (node.isMesh && node.material.name === "tabla") {
          node.material.color.set(new THREE.Color(item.deckColor))
          node.material.needsUpdate = true
        }
      })

      // Ajustar la posición inicial del skateboard
      model.position.set(0, 0, 0)

      // Crear un grupo para contener el modelo y permitir múltiples rotaciones
      const group = new THREE.Group()
      group.add(model)
      scene.add(group)

      // Guardar referencia al modelo y al grupo
      container.model = model
      container.group = group
      container.item = item

      // Variables para la animación
      let time = 0
      const speed = 0.01

      // Función de animación
      const animate = () => {
        requestAnimationFrame(animate)

        time += speed

        // Rotar el grupo (y por ende el skateboard) en múltiples ejes
        // group.rotation.x = Math.sin(time) * 0.5 // Rotación en X (cabeceo)
        // group.rotation.y = time // Rotación constante en Y
        group.rotation.z = time// Rotación en Z (balanceo)

        renderer.render(scene, camera)
      }

      // Iniciar animación
      animate()

      // Manejar resize
      window.addEventListener("resize", () => {
        if (container.clientWidth && container.clientHeight) {
          renderer.setSize(container.clientWidth, container.clientHeight)
          camera.aspect = container.clientWidth / container.clientHeight
          camera.updateProjectionMatrix()
        }
      })
    } catch (error) {
      console.error("Error al cargar el modelo:", error)
      container.innerHTML = '<div class="model-error">Error al cargar el modelo</div>'
    }
  }

  positionItems() {
    // Ocultar todos los elementos primero
    this.itemElements.forEach((item) => {
      item.classList.remove("active", "prev", "next")
      item.classList.add("hidden")
    })

    // Calcular índices para elementos visibles
    const totalItems = this.itemElements.length
    const prevIndex = (this.activeIndex - 1 + totalItems) % totalItems
    const nextIndex = (this.activeIndex + 1) % totalItems

    // Obtener elementos
    const activeItem = this.itemElements[this.activeIndex]
    const prevItem = this.itemElements[prevIndex]
    const nextItem = this.itemElements[nextIndex]

    // Aplicar clases
    activeItem.classList.remove("hidden")
    activeItem.classList.add("active")

    prevItem.classList.remove("hidden")
    prevItem.classList.add("prev")

    nextItem.classList.remove("hidden")
    nextItem.classList.add("next")

    // Guardar referencias
    this.visibleItems = {
      left: prevItem,
      center: activeItem,
      right: nextItem,
    }

    // Actualizar colores
    this.updateColors()

    console.log("Elementos posicionados:", {
      prev: prevIndex,
      active: this.activeIndex,
      next: nextIndex,
    })
  }

  updateColors() {
    // Esta función ya no es necesaria, ya que no cambiamos los colores
    // La dejamos vacía por si en el futuro se necesita realizar alguna actualización
  }

  slide(direction) {
    if (this.isAnimating) return

    this.isAnimating = true
    this.stopAutoplay()

    // Actualizar índice activo
    if (direction === "next") {
      this.activeIndex = (this.activeIndex + 1) % this.itemElements.length
    } else {
      this.activeIndex = (this.activeIndex - 1 + this.itemElements.length) % this.itemElements.length
    }

    // Aplicar transición
    this.itemsContainer.classList.add("transitioning", `transition-${direction}`)

    // Después de la transición, reposicionar elementos
    setTimeout(() => {
      this.itemsContainer.classList.remove("transitioning", `transition-${direction}`)
      this.positionItems()
      this.isAnimating = false
      this.startAutoplay()
    }, this.transitionSpeed)
  }

  setupControls() {
    // Botones de navegación
    this.prevButton.addEventListener("click", () => this.slide("prev"))
    this.nextButton.addEventListener("click", () => this.slide("next"))

    // Swipe en móviles
    let touchStartX = 0
    let touchEndX = 0

    this.carouselWrapper.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX
      },
      { passive: true },
    )

    this.carouselWrapper.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX
        this.handleSwipe()
      },
      { passive: true },
    )

    // Función para manejar el swipe
    this.handleSwipe = () => {
      const swipeThreshold = 50
      if (touchEndX < touchStartX - swipeThreshold) {
        this.slide("next")
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        this.slide("prev")
      }
    }
  }

  startAutoplay() {
    this.stopAutoplay()
    this.autoplayTimer = setInterval(() => {
      this.slide("next")
    }, this.autoplaySpeed)
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer)
      this.autoplayTimer = null
    }
  }
}

// Función para cargar los diseños desde la API
async function loadSavedDesigns() {
  const container = document.getElementById("designs-container")

  try {
    console.log("Cargando diseños desde la API...")
    container.innerHTML = '<div class="loading">Cargando diseños...</div>'

    const response = await fetch("/api/designs")
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const designs = await response.json()
    console.log("Diseños cargados:", designs)

    if (!designs || designs.length === 0) {
      container.innerHTML = '<div class="no-designs">No hay diseños disponibles</div>'
      return
    }

    // Inicializar carrusel
    new InfiniteCarousel({
      container: container,
      items: designs,
      autoplaySpeed: 5000,
      transitionSpeed: 500,
    })
  } catch (error) {
    console.error("Error al cargar los diseños:", error)
    container.innerHTML = `<div class="error-message">Error al cargar los diseños: ${error.message}</div>`
  }
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", loadSavedDesigns)

// Exportar la clase para uso externo
export { InfiniteCarousel }

