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
    <!-- Gráfico de Stock -->
    <div
      class="w-12 h-40rem flex justify-content-center align-items-center"
      v-if="selectedData.value === 'less-stock'"
    >
      <Chart class="card w-7 h-full" type="bar" :data="chartData" :options="chartOptions" />
    </div>
    <!-- Gráfico de Ventas -->
    <div
      class="w-12 h-40rem flex justify-content-center align-items-center"
      v-if="selectedData.value === 'more-sales'"
    >
      <Chart class="card w-7 h-full" type="bar" :data="salesChartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import Chart from 'primevue/chart'
import axios from 'axios'
import Dropdown from 'primevue/dropdown'

// Utilizaremos una API para obtener los datos de forma centralizada.
const api = axios.create({ baseURL: 'http://localhost:3000' })

// Variables reactivas y su inicialización
const filterData = ref([
  { name: 'Menos Stock', value: 'less-stock' },
  { name: 'Más Ventas', value: 'more-sales' }
])
const selectedData = ref('less-stock')
const chartData = ref({})
const salesChartData = ref({})
const chartOptions = ref({
  scales: { y: { beginAtZero: true } },
  responsive: true,
  maintainAspectRatio: false
})


// fetchData se convierte en una función asíncrona autollamada para inmediatamente obtener datos.
const fetchData = async () => {
  try {
    if (selectedData.value === 'less-stock') {
      const { data: products } = await api.get('/products')
      prepareStockChartData(products)
    } else {
      const { data: sales } = await api.get('/sales')
      prepareSalesChartData(sales)
    }
  } catch (error) {
    console.error(`Error al obtener los datos: ${error.message}`)
  }
}

// Este watchEffect reemplaza al anterior watch con { immediate: true }
watchEffect(() => {
  fetchData()
})
function prepareStockChartData(products) {
  // Preparación de datos para el gráfico de stock
  chartData.value = {
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: 'Stock de Productos',
        data: products.map((p) => p.stock),
        backgroundColor: products.map((p) =>
          p.stock < 20 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)'
        ),
        borderColor: products.map((p) =>
          p.stock < 20 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'
        ),
        borderWidth: 1
      }
    ]
  }
}

function prepareSalesChartData(sales) {
  // Preparación de datos para el gráfico de ventas
  const salesData = sales.reduce((acc, sale) => {
    const date = formatDate(sale.date)
    acc[date] = (acc[date] || 0) + sale.total
    return acc
  }, {})

  const sortedDates = Object.keys(salesData).sort()
  salesChartData.value = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Ventas Diarias',
        data: sortedDates.map((date) => salesData[date]),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }
}

function formatDate(date) {
  // Formateo de fecha simplificado y centralizado
  return date.split('T')[0]
}
</script>
