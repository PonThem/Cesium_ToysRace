<template>
  <div class="toy-rank-panel">
    <div class="rank-title">toys rank</div>
    <div
      v-for="(rank, index) in sortedRanks"
      :key="rank?.number ?? index"
      :id="'rank' + index"
      class="rank-item"
      :class="{ active: rank.number === currentToyNumber }"
      @click="$emit('select-toy', rank.number)"
    >
      <span class="rank-number">{{ rank.number }}</span>
      <span class="rank-position">{{ rank.position }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sortedRanks: { type: Array, default: () => [] },
  currentToyNumber: { type: String, default: '' }
})

defineEmits(['select-toy'])
</script>

<style scoped>
.toy-rank-panel {
  position: fixed;
  bottom: clamp(10px, 15vh, 30%);
  right: clamp(8px, 1.5vw, 16px);
  min-height: clamp(50px, 8vh, 80px);
  width: clamp(120px, 18vw, 220px);
  z-index: 99999;
  background: rgba(20, 20, 28, 0.95);
  backdrop-filter: blur(8px);
  border-radius: clamp(0.3em, 0.5vw, 0.6em);
  color: white;
  text-align: center;
  border: clamp(1px, 0.2vw, 2px) solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 clamp(2px, 0.4vh, 4px) clamp(12px, 2vh, 24px) rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  pointer-events: auto;
}

.rank-title {
  font-size: clamp(0.9em, 1.3vw, 1.25em);
  padding: clamp(4px, 1vh, 10px) 0;
  color: rgba(255, 255, 255, 0.9);
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(3px, 0.6vw, 6px) clamp(8px, 1.2vw, 14px);
  margin: clamp(1px, 0.2vh, 3px) clamp(2px, 0.5vw, 6px);
  border-radius: clamp(0.3em, 0.5vw, 0.6em);
  cursor: pointer;
  color: white;
  background: rgba(0, 0, 0, 0.5);
}

.rank-item.active {
  background: rgba(0, 0, 255, 0.5);
}

.rank-item:hover {
  opacity: 0.9;
}

.rank-number,
.rank-position {
  font-size: clamp(0.9em, 1.3vw, 1.25em);
}
</style>
