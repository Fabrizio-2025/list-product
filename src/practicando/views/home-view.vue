<template>
  <div>
    <Toast></Toast>
    <h1>Productos</h1>
    <div class="flex justify-content-between align-items-center">
      <Button class="w-1" icon="pi pi-plus" @click="openCreatePopup">Crear Producto</Button>
      <div class="card flex justify-content-center">
        <AutoComplete
          v-model="autocompleteValue"
          :suggestions="brandSuggestions"
          @complete="search"
        />
      </div>
    </div>
    <DataTable :value="filteredProducts">
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
          <h1 class="h-3rem m-0 p-0">Edit Product</h1>
          <div class="h-15rem flex flex-column justify-content-evenly">
            <FloatLabel>
              <InputText class="w-12" v-model="editProductName" />
              <label>Edit Product Name</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-12" v-model="editProductDescription" />
              <label>Edit Product Description</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-12" v-model="editProductBrand" />
              <label>Edit Product Brand</label>
            </FloatLabel>
          </div>
          <InputNumber
            v-model="editProductStock"
            showButtons
            buttonLayout="vertical"
            style="width: 3rem"
            :min="0"
            :max="99"
            class="m-2"
          >
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
          <Button
            class="flex justify-content-center"
            @click="updateProduct"
            :disabled="isUpdateButtonDisabled"
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
          <h1 class="h-3rem m-0 p-0">Add Product</h1>
          <div class="h-15rem flex flex-column justify-content-evenly">
            <FloatLabel>
              <InputText class="w-12" v-model="newProductName" />
              <label>New Product Name</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-12" v-model="newProductDescription" />
              <label>New Product Description</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-12" v-model="newProductBrand" />
              <label>New Product Brand</label>
            </FloatLabel>
          </div>
          <InputNumber
            v-model="newProductStock"
            showButtons
            buttonLayout="vertical"
            style="width: 3rem"
            :min="0"
            :max="99"
            class="m-2"
          >
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>

          <Button
            class="w-3 justify-content-center m-1"
            @click="addProduct"
            :disabled="isAddButtonDisabled"
            >Añadir Producto</Button
          >
          <Button class="p-button-danger w-3 justify-content-center m-1" @click="closeCreatePopup"
            >Cerrar</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { Product } from '../models/products'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import AutoComplete from 'primevue/autocomplete'

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
const autocompleteValue = ref('')
const brandSuggestions = ref<string[]>([])

interface AutoCompleteSearchEvent {
  query: string
}

const isUpdateButtonDisabled = computed(() => {
  if (!editProduct.value) {
    return true // Si no hay producto seleccionado para editar, deshabilita el botón.
  }

  const fieldsFilled =
    editProductName.value.trim() !== '' &&
    editProductBrand.value.trim() !== '' &&
    editProductStock.value > 0

  return !fieldsFilled
})

const isAddButtonDisabled = computed(() => {
  return (
    newProductName.value.trim() === '' ||
    newProductBrand.value.trim() === '' ||
    newProductStock.value <= 0 // Asumiendo que el stock no puede ser 0 o negativo.
  )
})

const showError = (summary: string, detail: string) => {
  toast.add({
    severity: 'error',
    summary: summary,
    detail: detail,
    life: 3000
  })
}

const uniqueBrands = computed(() => {
  const brands = new Set(products.value.map((product) => product.brand))
  return Array.from(brands)
})

function search(event: AutoCompleteSearchEvent) {
  brandSuggestions.value = uniqueBrands.value.filter((brand) =>
    brand.toLowerCase().includes(event.query.toLowerCase())
  )
}

const filteredProducts = computed(() => {
  if (autocompleteValue.value) {
    return products.value.filter((product) =>
      product.brand.toLowerCase().includes(autocompleteValue.value.toLowerCase())
    )
  }
  return products.value
})

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
      return response.json()
    })
    .then(() => {
      fetchProducts() // Recarga la lista de productos después de eliminar
      toast.add({
        severity: 'warn',
        summary: 'Producto Eliminado',
        detail: 'El producto ha sido eliminado exitosamente.',
        life: 3000
      })
    })
    .catch((error) => {
      console.error('Error:', error)
      showError('Error', 'No se pudo eliminar el producto.')
    })
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
    };

    fetch(`http://localhost:3000/products/${editProduct.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct)
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      fetchProducts(); // Fetch the updated list of products
      closeEditPopup(); // Close the edit popup dialog
      toast.add({ severity: 'info', summary: 'Producto Modificado', detail: 'El producto ha sido modificado exitosamente.', life: 3000 });
    })
    .catch((error) => {
      console.error('Error:', error);
      showError('Error', 'No se pudo modificar el producto.');
    });
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
  height: 59vh;
  width: 35vw;
}
</style>
