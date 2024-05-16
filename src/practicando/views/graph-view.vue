<template>
  <div>
    <h2>Gráfico:</h2>
    <div class="flex justify-content-between">
      <a class="font-bold text-primary-600" href="/">Regresar</a>
      <Dropdown
        class="w-3"
        v-model="selectedData"
        placeholder="Selecciona los Datos"
        :options="filterData"
        optionLabel="name"
      />
    </div>
    <!-- Gráfico de Marca -->
    <div
      class="w-12 h-20rem flex justify-content-center align-items-center"
      v-if="selectedData.value === 'more-market'"
    >
      <Chart
        class="flex justify-content-center card w-7 h-full"
        type="pie"
        :data="brandChartData"
        :options="brandChartOptions"
      />
    </div>
    <!-- Búsqueda de Productos por Boleta -->
    <div
      class="w-12 h-40rem flex justify-content-center align-items-center flex-column"
      v-if="selectedData.value === 'search-by-receipt'"
    >
      <input
        type="number"
        v-model="saleId"
        placeholder="Ingrese el ID de la boleta"
        class="p-inputtext p-component m-2"
      />
      <button @click="fetchSaleDetails" class="p-button p-component">Buscar</button>
      <ul>
        <li class="list-decimal" v-for="product in saleDetails" :key="product.id">
          {{ product.name }} - {{ product.brand }} - ${{ product.price }}
        </li>
      </ul>
      <div>
        <strong>Total: ${{ totalAmount }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import Chart from 'primevue/chart'
import axios from 'axios'
import Dropdown from 'primevue/dropdown'

// Utilizaremos una API para obtener los datos de forma centralizada.
const api = axios.create({ baseURL: 'http://localhost:3000' })

const brandChartData = ref({}) // Datos para el gráfico de marcas
const brandChartOptions = ref({}) // Opciones para el gráfico de marcas
const saleDetails = ref([]) // Detalles de la venta
const saleId = ref(null) // ID de la boleta a buscar

const totalAmount = computed(() => {
  const total = saleDetails.value.reduce((sum, product) => {
    return sum + product.price;
  }, 0);
  return total.toFixed(2); // Asegura tres decimales
});

function getRandomColor() {
  let color = 'rgba('
  for (let i = 0; i < 3; i++) {
    color += Math.floor(Math.random() * 256) + ','
  }
  color += '0.5)' // Ajusta la opacidad para backgroundColor
  return color
}

function getRandomHoverColor(baseColor) {
  let hoverColor = baseColor.slice(0, baseColor.lastIndexOf(',')) + ',0.8)' // Aumenta la opacidad para hover
  return hoverColor
}

// Variables reactivas y su inicialización
const filterData = ref([
  { name: 'Mas Mercado', value: 'more-market' },
  { name: 'Buscar Productos por Boleta', value: 'search-by-receipt' }
])
const selectedData = ref('more-market')

// Definición de funciones antes de su uso
const fetchData = async () => {
  try {
    if (selectedData.value === 'more-market') {
      const { data: products } = await api.get('/products')
      prepareBrandChartData(products)
    }
  } catch (error) {
    console.error(`Error al obtener los datos: ${error.message}`)
  }
}

const fetchSaleDetails = async () => {
  try {
    const { data: saleDetailsData } = await api.get(`/sale-details/sale/${saleId.value}`)
    saleDetails.value = saleDetailsData
  } catch (error) {
    console.error(`Error al obtener los detalles de la venta: ${error.message}`)
  }
}

function prepareBrandChartData(products) {
  const brandCounts = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1
    return acc
  }, {})

  const brandLabels = Object.keys(brandCounts)
  const brandData = brandLabels.map((brand) => brandCounts[brand])
  const backgroundColors = brandLabels.map(() => getRandomColor())
  const hoverBackgroundColors = backgroundColors.map((color) => getRandomHoverColor(color))

  brandChartData.value = {
    labels: brandLabels,
    datasets: [
      {
        data: brandData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors
      }
    ]
  }

  brandChartOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'bottom'
    },
    cutoutPercentage: 50 // Ajusta esto para un gráfico tipo dona
  }
}

// watchEffect se usa después de definir fetchData
watchEffect(() => {
  fetchData()
})
</script>

<style>
</style>
