<template>
  <div ref="containerRef" class="cesium-container" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { CESIUM_ION_TOKEN } from '@/config/constants'

const props = defineProps({
  ready: { type: Boolean, default: false }
})

const emit = defineEmits(['viewer-ready'])

const containerRef = ref(null)
let viewer = null

const DEBUG = true
const log = (msg, ...args) => DEBUG && console.log('[CesiumMapViewer]', msg, ...args)

onMounted(() => {
  log('onMounted', { hasContainer: !!containerRef.value })
  if (typeof window.Cesium === 'undefined') {
    console.error('[CesiumMapViewer] Cesium not loaded. Ensure it is included in index.html')
    return
  }
  const Cesium = window.Cesium
  Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

  if (!containerRef.value) return
  viewer = new Cesium.Viewer(containerRef.value, {
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    infoBox: false,
    selectionIndicator: false,
    timeline: false,
    shouldAnimate: true
  })
  viewer.scene.debugShowFramesPerSecond = false

  viewer.imageryLayers.addImageryProvider(
    new Cesium.IonImageryProvider({ assetId: 2 })
  )

  log('viewer created, emitting viewer-ready')
  emit('viewer-ready', viewer)
})

onUnmounted(() => {
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy()
  }
})

defineExpose({
  getViewer: () => viewer,
  containerRef
})
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
