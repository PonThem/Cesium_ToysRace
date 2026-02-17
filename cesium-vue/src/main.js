import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('[ERROR] Vue component error:', info, '\n  Component:', instance?.$?.type?.__name ?? 'unknown', '\n  Error:', err?.message ?? err)
  if (err?.stack) console.error('  Stack:', err.stack)
}

app.mount('#app')
