<template>
  <div ref="containerRef" class="small-map" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  center: { type: Array, default: () => [25.4, 121.99] },
  zoom: { type: Number, default: 8 },
  option: { type: String, default: 'default' }
})

const emit = defineEmits(['map-ready'])

const containerRef = ref(null)
let map = null
let pointsMap = new Map()

const DEBUG = true
const log = (msg, ...args) => DEBUG && console.log('[SmallMap]', msg, ...args)

function initToyPoints(flightData, demoFakeDataToys, curToyNumber) {
  log('initToyPoints', { hasMap: !!map, toys: demoFakeDataToys?.length })
  if (!map || typeof window.L === 'undefined') return
  const L = window.L
  for (let i = 0; i < demoFakeDataToys.length; i++) {
    const lat = flightData[i][0]?.latitude ?? props.center[0]
    const lng = flightData[i][0]?.longitude ?? props.center[1]
    const pt = L.circleMarker([lat, lng], { radius: 1 })
    if (demoFakeDataToys[i].number === curToyNumber) {
      pt.setStyle({ color: 'red' })
    } else {
      pt.setStyle({ color: 'rgba(255, 255, 255,.5)' })
    }
    pt.addTo(map)
    pointsMap.set(demoFakeDataToys[i].number, pt)
  }
}

onMounted(() => {
  log('onMounted', { hasContainer: !!containerRef.value })
  if (typeof window.L === 'undefined') {
    console.error('[SmallMap] Leaflet not loaded. Ensure it is included in index.html')
    return
  }
  const L = window.L

  if (!containerRef.value) return

  map = L.map(containerRef.value, { zoomControl: false }).setView(
    props.center,
    props.option === 'taiwan' ? 6 : props.zoom
  )

  L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    { maxZoom: 20 }
  ).addTo(map)

  log('map created, emitting map-ready')
  emit('map-ready', {
    map,
    pointsMap,
    setCenter,
    updatePoint,
    changeToyColor,
    initToyPoints
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

function setCenter(lat, lng) {
  if (map) map.setView([lat, lng], props.zoom)
}

function updatePoint(toyNumber, lat, lng) {
  let pt = pointsMap.get(toyNumber)
  if (pt) {
    pt.setLatLng([lat, lng])
  }
}

function changeToyColor(lastNumber, toyNumber) {
  const last = pointsMap.get(lastNumber)
  if (last) last.setStyle({ color: 'rgba(255, 255, 255,.5)' })
  const cur = pointsMap.get(toyNumber)
  if (cur) cur.setStyle({ color: 'red' })
}

defineExpose({
  getMap: () => map,
  pointsMap,
  setCenter,
  updatePoint,
  changeToyColor,
  initToyPoints
})
</script>

<style scoped>
.small-map {
  position: absolute;
  left: clamp(8px, 1vw, 16px);
  top: clamp(8px, 1vh, 16px);
  width: min(28vw, 360px);
  height: min(28vh, 280px);
  min-width: 140px;
  min-height: 120px;
  z-index: 1;
}
</style>
