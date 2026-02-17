# Cesium Vue Demo

Vue 3 refactor of the Cesium pigeon race demo. The original monolithic JS has been converted to Vue 3 components and composables.

## Setup

```bash
cd cesium-vue
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Structure

- **index.html** – Loads Cesium and Leaflet from CDN (Chart.js via npm)
- **src/App.vue** – Main layout, orchestrates viewer + UI components
- **src/components/**
  - `CesiumMapViewer.vue` – 3D Cesium map
  - `SmallMap.vue` – 2D Leaflet overview
  - `PigeonRankPanel.vue` – Pigeon ranking list
  - `PigeonInfosChart.vue` – Chart.js elevation/speed chart
  - `PigeonDashBoard.vue` – Speed, elevation, distance stats
  - `PointInfoBox.vue` – Click info popup
- **src/composables/usePigeonRace.js** – Race logic, entity setup, clock handling
- **src/data/demoData.js** – Extracted demo data (from original)
- **src/lib/CityManage.js** – City filtering logic
- **src/utils/cesiumUtils.js** – Time/coordinate helpers
- **src/config/constants.js** – Models, colors, tokens
