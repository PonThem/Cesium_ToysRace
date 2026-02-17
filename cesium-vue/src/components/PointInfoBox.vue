<template>
  <div v-if="info" class="point-info-box" v-html="info" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  info: { type: String, default: '' }
})
</script>

<style scoped>
.point-info-box {
  position: absolute;
  top: clamp(8px, 8vh, 80px);
  right: clamp(8px, 5vw, 60px);
  padding: clamp(8px, 1.5vh, 14px) clamp(12px, 1.5vw, 18px);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: clamp(12px, 1.4vw, 15px);
  max-width: min(90vw, 360px);
  z-index: 10;
}
</style>
