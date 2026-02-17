<template>
  <div class="toy-dashboard" role="status" aria-label="Toy flight metrics">
    <div
      v-for="item in metricItems"
      :key="item.key"
      class="metric-slot"
    >
      <span class="metric-value">{{ item.displayValue }}</span>
      <span class="metric-unit">{{ item.unit }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  speed: { type: Number, default: 0 },
  elevation: { type: Number, default: 0 },
  flyDistance: { type: Number, default: 0 },
  leftDistance: { type: Number, default: 0 }
})

const safeNum = (n) =>
  typeof n === 'number' && !Number.isNaN(n) ? n : 0

const metricItems = computed(() => {
  const sv = safeNum(props.speed)
  const ev = safeNum(props.elevation)
  const fv = safeNum(props.flyDistance)
  const lv = safeNum(props.leftDistance)
  return [
    { key: 'speed', displayValue: String(Math.round(sv)).padStart(5), unit: 'm/min' },
    { key: 'flyDistance', displayValue: (fv / 1000).toFixed(1).padStart(5), unit: 'km' },
    { key: 'elevation', displayValue: String(Math.round(ev)).padStart(5), unit: 'm' },
    { key: 'leftDistance', displayValue: (lv / 1000).toFixed(1).padStart(5), unit: 'km' }
  ]
})
</script>

<style scoped>
.toy-dashboard {
  position: fixed;
  top: clamp(12px, 3vh, 56px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  gap: 0;
  padding: 0 clamp(4px, 0.5vw, 8px);
  background: rgba(12, 12, 14, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: clamp(8px, 1.2vw, 14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  font-variant-numeric: tabular-nums;
}

.metric-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: clamp(72px, 10vw, 110px);
  padding: clamp(6px, 1.2vh, 12px) clamp(10px, 1.5vw, 18px);
  gap: clamp(2px, 0.3vh, 4px);
}

.metric-slot:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.metric-value {
  font-size: clamp(0.9rem, 1.4vw, 1.35rem);
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.05em;
  font-family: ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, monospace;
}

.metric-unit {
  font-size: clamp(0.5rem, 0.75vw, 0.7rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 520px) {
  .toy-dashboard {
    flex-wrap: wrap;
    justify-content: center;
    max-width: calc(100vw - clamp(16px, 4vw, 32px));
  }

  .metric-slot {
    min-width: clamp(60px, 15vw, 85px);
    padding: clamp(4px, 1vh, 8px) clamp(8px, 2vw, 12px);
  }

  .metric-slot:nth-child(2) {
    border-right: none;
  }

  .metric-value {
    font-size: clamp(0.85rem, 2.5vw, 1.15rem);
  }
}
</style>
