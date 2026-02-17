<template>
  <div v-if="props.toyData?.length && !chartInitFailed" class="chart-container">
    <canvas ref="chartRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  toyData: {
    type: Array,
    default: () => []
  },
  currentIndex: { type: Number, default: 0 }
})

const chartRef = ref(null)
const chartInitFailed = ref(false)
let chartInstance = null

function initChart() {
  if (!chartRef.value || !props.toyData.length) return

  chartInitFailed.value = false
  const dataX = []
  const dataElevation = []
  const dataSpeed = []
  for (let i = 0; i < props.toyData.length; i++) {
    const pt = props.toyData[i]
    dataX.push(i)
    dataElevation.push(pt?.elevation ?? 0)
    dataSpeed.push(pt?.speed ?? 0)
  }

  try {
    chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: dataX,
      datasets: [
        {
          type: 'line',
          data: dataElevation,
          borderColor: 'rgba(255,255,0,0.5)',
          fill: false,
          tension: 0
        },
        {
          type: 'line',
          data: [],
          backgroundColor: 'rgba(0, 0, 255, 0.5)',
          fill: true
        },
        {
          type: 'line',
          data: dataSpeed,
          borderColor: 'rgba(255,255,255,0.5)',
          fill: false,
          tension: 0.1
        },
        {
          type: 'line',
          data: [],
          borderColor: 'rgba(255, 0, 0, 0.5)',
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      elements: { point: { radius: 0 } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { display: false }
        },
        x: {
          ticks: { maxTicksLimit: 0 },
          grid: { display: false }
        }
      }
    }
  })
  } catch (err) {
    console.error('[ToyInfosChart] Chart init failed', err?.message ?? err)
    chartInstance = null
    chartInitFailed.value = true
  }
}

function updateProgress(index) {
  if (!chartInstance || !props.toyData?.length) return
  const idx = Math.min(Math.max(0, index), props.toyData.length - 1)
  chartInstance.data.datasets[1].data = props.toyData
    .slice(0, idx + 1)
    .map((d) => d?.elevation ?? 0)
  chartInstance.data.datasets[3].data = props.toyData
    .slice(0, idx + 1)
    .map((d) => d?.speed ?? 0)
  chartInstance.update()
}

onMounted(() => {
  nextTick(() => {
    initChart()
    if (props.currentIndex > 0) {
      updateProgress(props.currentIndex)
    }
  })
})

watch(
  () => props.toyData,
  () => {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    chartInitFailed.value = false
    if (props.toyData?.length) {
      nextTick(() => {
        initChart()
        updateProgress(props.currentIndex)
      })
    }
  },
  { deep: true }
)

watch(() => props.currentIndex, (idx) => updateProgress(idx))

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

defineExpose({
  updateProgress,
  chartRef
})
</script>

<style scoped>
.chart-container {
  position: fixed;
  left: 50%;
  bottom: clamp(16px, 4vh, 60px);
  transform: translateX(-50%);
  width: min(92vw, 520px);
  height: clamp(80px, 15vh, 140px);
  z-index: 9999;
  background: rgba(12, 12, 14, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

</style>
