<template>
  <div>
    <h2>Grafico:</h2>
    <a class="font-bold text-primary-600" href="/">Regresar</a>
  </div>
  <div class="w-12 h-30rem flex justify-content-center align-items-center">
    <Chart class="card w-7 h-25rem" type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'primevue/chart'
import axios from 'axios'

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Cantidad de Productos',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }
  ]
})

const chartOptions = ref({
  scales: {
    y: {
      beginAtZero: true
    }
  },
  responsive: true,
  maintainAspectRatio: false
})

onMounted(async () => {
  try {
    const { data: products } = await axios.get('http://localhost:3000/products')
    const brandMap = new Map()

    // Contar productos por marca
    products.forEach((product) => {
      brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1)
    })

    // Preparar datos para el gráfico
    chartData.value.labels = Array.from(brandMap.keys())
    chartData.value.datasets[0].data = Array.from(brandMap.values())

    // Colores para cada marca
    chartData.value.datasets[0].backgroundColor = chartData.value.labels.map(
      () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`
    )
    chartData.value.datasets[0].borderColor = chartData.value.labels.map(
      () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`
    )
  } catch (error) {
    console.error('Error fetching products:', error)
  }
})
</script>
