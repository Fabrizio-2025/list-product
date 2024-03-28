<template>
  <div>
    <Toast></Toast>
    <h1>Productos</h1>
    
    <Button class="w-1" icon="pi pi-plus" @click="openCreatePopup">Crear Producto</Button>
    <DataTable :value="products">
      <Column field="id" sortable header="ID"></Column>
      <Column field="name" header="Nombre"></Column>
      <Column field="description" header="Descripción"></Column>
      <Column field="brand" sortable header="Marca"></Column>
      <Column field="stock" sortable header="Stock"></Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            class="p-button-danger w-3 m-2"
            @click="deleteProduct(slotProps.data.id)"
            >Eliminar</Button
          >
          <Button
            icon="pi pi-pencil"
            class="p-button-info w-3 m-2"
            @click="openEditPopup(slotProps.data)"
            >Modificar</Button
          >
        </template>
      </Column>
    </DataTable>
    
    <!-- Edit Popup -->
    <div v-if="editPopupVisible" class="overlay">
      <div class="popup">
        <div class="flex flex-column">
          <input type="text" v-model="editProductName" placeholder="Nombre del Producto" />
          <input type="text" v-model="editProductDescription" placeholder="Descripción" />
          <input type="text" v-model="editProductBrand" placeholder="Marca" />
          <input type="number" v-model.number="editProductStock" placeholder="Stock" />
          <Button class="flex justify-content-center" @click="updateProduct"
            >Actualizar Producto</Button
          >
          <Button class="p-button-danger flex justify-content-center" @click="closeEditPopup"
            >Cerrar</Button
          >
        </div>
      </div>
    </div>

    <!-- Create Popup -->
    <div v-if="createPopupVisible" class="overlay">
      <div class="popup">
        <div class="flex flex-column">
          <input type="text" v-model="newProductName" placeholder="Nombre del Producto" />
          <input type="text" v-model="newProductDescription" placeholder="Descripción" />
          <input type="text" v-model="newProductBrand" placeholder="Marca" />
          <input type="number" v-model.number="newProductStock" placeholder="Stock" />
          <Button @click="addProduct">Añadir Producto</Button>
          <Button class="p-button-danger" @click="closeCreatePopup">Cerrar</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Product } from '../models/products'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast';

const products = ref<Product[]>([])
const newProductName = ref('')
const newProductDescription = ref('')
const newProductBrand = ref('')
const newProductStock = ref(0)

const editPopupVisible = ref(false)
const createPopupVisible = ref(false)
const editProduct = ref<Product | null>(null)
const editProductName = ref('')
const editProductDescription = ref('')
const editProductBrand = ref('')
const editProductStock = ref(0)
const toast = useToast()

const showError = (summary: string, detail: string) => {
  toast.add({
    severity: 'error',
    summary: summary,
    detail: detail,
    life: 3000
  })
}

function productExists(name: string, brand: string): boolean {
  return products.value.some((product) => product.name === name && product.brand === brand)
}

function fetchProducts() {
  fetch('http://localhost:3000/products')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      products.value = data
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
function closeCreatePopup() {
  createPopupVisible.value = false
  newProductName.value = ''
  newProductDescription.value = ''
  newProductBrand.value = ''
  newProductStock.value = 0
}

function openCreatePopup() {
  createPopupVisible.value = true
}

function deleteProduct(productId: number) {
  fetch(`http://localhost:3000/products/${productId}`, {
    method: 'DELETE'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
    })
    .then(() => fetchProducts()) // Recarga la lista de productos después de eliminar
    .catch((error) => console.error('Error:', error))
}

function addProduct() {
  if (productExists(newProductName.value, newProductBrand.value)) {
    showError('Error al añadir', 'El producto ya existe con el mismo nombre y marca.')
    closeCreatePopup()
    return
  }

  const newProduct = {
    name: newProductName.value,
    description: newProductDescription.value,
    brand: newProductBrand.value,
    stock: newProductStock.value
  }

  fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newProduct)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(() => {
      // Clear the input fields after successful addition
      newProductName.value = ''
      newProductDescription.value = ''
      newProductBrand.value = ''
      newProductStock.value = 0
      fetchProducts() // Fetch the updated list of products
      closeCreatePopup()
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function openEditPopup(product: Product) {
  editProduct.value = product
  editProductName.value = product.name
  editProductDescription.value = product.description
  editProductBrand.value = product.brand
  editProductStock.value = product.stock
  editPopupVisible.value = true
}

function closeEditPopup() {
  editProduct.value = null
  editProductName.value = ''
  editProductDescription.value = ''
  editProductBrand.value = ''
  editProductStock.value = 0
  editPopupVisible.value = false
}

function updateProduct() {
  if (editProduct.value) {
    const updatedProduct = {
      ...editProduct.value,
      name: editProductName.value,
      description: editProductDescription.value,
      brand: editProductBrand.value,
      stock: editProductStock.value
    }

    fetch(`http://localhost:3000/products/${editProduct.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(() => {
        fetchProducts() // Fetch the updated list of products
        closeEditPopup() // Close the edit popup dialog
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #ccc;
  padding: 20px;
  background-color: white;
  z-index: 1000;
  height: 50vh;
  width: 50vw;
}
</style>
