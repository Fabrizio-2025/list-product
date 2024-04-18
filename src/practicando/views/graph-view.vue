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
import { ref, watchEffect } from 'vue'
import Chart from 'primevue/chart'
import axios from 'axios'
import Dropdown from 'primevue/dropdown'

const brandChartData = ref({}) // Datos para el gráfico de marcas
const brandChartOptions = ref({}) // Opciones para el gráfico de marcas

// Utilizaremos una API para obtener los datos de forma centralizada.
const api = axios.create({ baseURL: 'http://localhost:3000' })

function getRandomColor() {
  let color = 'rgba(';
  for (let i = 0; i < 3; i++) {
    color += Math.floor(Math.random() * 256) + ',';
  }
  color += '0.5)'; // Ajusta la opacidad para backgroundColor
  return color;
}

function getRandomHoverColor(baseColor) {
  let hoverColor = baseColor.slice(0, baseColor.lastIndexOf(',')) + ',0.8)'; // Aumenta la opacidad para hover
  return hoverColor;
}


// Variables reactivas y su inicialización
const filterData = ref([
  { name: 'Mas Mercado', value: 'more-market' },
  { name: 'Más Ventas', value: 'more-sales' }
])
const selectedData = ref('more-market')
const salesChartData = ref({})
const chartOptions = ref({
  scales: { y: { beginAtZero: true } },
  responsive: true,
  maintainAspectRatio: false
})

// fetchData se convierte en una función asíncrona autollamada para inmediatamente obtener datos.
const fetchData = async () => {
  try {
    if (selectedData.value === 'more-market') {
      const { data: products } = await api.get('/products')
      prepareBrandChartData(products)
    } else if (selectedData.value === 'more-sales') {
      // ... tus otras condiciones aquí ...
    }
  } catch (error) {
    console.error(`Error al obtener los datos: ${error.message}`)
  }
}

watchEffect(() => {
  fetchData()
})
function prepareBrandChartData(products) {
  const brandCounts = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {});

  const brandLabels = Object.keys(brandCounts);
  const brandData = brandLabels.map(brand => brandCounts[brand]);
  const backgroundColors = brandLabels.map(() => getRandomColor());
  const hoverBackgroundColors = backgroundColors.map(color => getRandomHoverColor(color));

  brandChartData.value = {
    labels: brandLabels,
    datasets: [
      {
        data: brandData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors,
      }
    ]
  };

  brandChartOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'bottom'
    },
    cutoutPercentage: 50, // Ajusta esto para un gráfico tipo dona
  };}
</script>
