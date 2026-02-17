<template>
  <div class="app-wrapper">
    <div class="cesium-wrapper">
      <CesiumMapViewer @viewer-ready="onViewerReady" />
    </div>
    <SmallMap
      ref="smallMapRef"
      :center="smallMapCenter"
      @map-ready="onSmallMapReady"
    />
    <Teleport to="body">
      <ToyRankPanel
        :sorted-ranks="race.uiState.sortedRanks"
        :current-toy-number="race.uiState.currentToyNumber"
        @select-toy="race.onSelectToy"
      />
    </Teleport>
    <Teleport to="body">
      <ToyInfosChart
        :toy-data="race.uiState.chartToyData"
        :current-index="race.uiState.chartCurrentIndex"
      />
    </Teleport>
    <Teleport to="body">
      <ToyDashBoard
        :speed="race.uiState.dashboardSpeed"
        :elevation="race.uiState.dashboardElevation"
        :fly-distance="race.uiState.dashboardFlyDistance"
        :left-distance="race.uiState.dashboardLeftDistance"
      />
    </Teleport>
    <PointInfoBox :info="race.uiState.pointInfo" />
    <div v-if="race.error && String(race.error).trim()" class="error-overlay">
      {{ race.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef } from 'vue'
import CesiumMapViewer from '@/components/CesiumMapViewer.vue'
import SmallMap from '@/components/SmallMap.vue'
import ToyRankPanel from '@/components/ToyRankPanel.vue'
import ToyInfosChart from '@/components/ToyInfosChart.vue'
import ToyDashBoard from '@/components/ToyDashBoard.vue'
import PointInfoBox from '@/components/PointInfoBox.vue'
import { useToyRace } from '@/composables/useToyRace'

const DEBUG = true
const log = (msg, ...args) => DEBUG && console.log('[App]', msg, ...args)

const race = useToyRace()
log('race composable created', { loading: race.loading.value })
const cesiumViewerRef = shallowRef(null)
const smallMapRef = ref(null)
let smallMapApi = null

const smallMapCenter = computed(() => {
  if (race.flightData?.length && race.flightData[0]?.length) {
    const p = race.flightData[0][0]
    return [p.latitude, p.longitude]
  }
  return [25.4, 121.99]
})

function onViewerReady(viewer) {
  log('onViewerReady', !!viewer)
  cesiumViewerRef.value = viewer
  if (smallMapApi) {
    log('onViewerReady: smallMap already ready, calling race.init')
    race.init(viewer, smallMapApi)
  } else {
    log('onViewerReady: smallMap not ready yet, waiting')
  }
}

function onSmallMapReady(api) {
  log('onSmallMapReady', { hasApi: !!api, apiKeys: api ? Object.keys(api) : [] })
  smallMapApi = api
  if (cesiumViewerRef.value) {
    log('onSmallMapReady: viewer already ready, calling race.init')
    race.init(cesiumViewerRef.value, api)
  } else {
    log('onSmallMapReady: viewer not ready yet, waiting')
  }
}
</script>

<style scoped>
.app-wrapper {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.cesium-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.error-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #c00;
  color: white;
  border-radius: 8px;
  z-index: 100;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
