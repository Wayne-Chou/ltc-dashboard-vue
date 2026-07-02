import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import { useAppStore } from '@/stores/app'

import 'bootstrap/dist/css/bootstrap.min.css'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

window.bootstrap = bootstrap

import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/styles/main.css'
import '@/styles/globalLoading.css'
import '@/styles/cookieConsent.css'

import '@/styles/personDetail.css'
const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

useAppStore(pinia)

// Clear stale modal backdrops after HMR / route changes during dev
if (import.meta.hot) {
  import('@/utils/bootstrapCleanup').then(
    ({ cleanupBootstrapModalArtifacts }) => {
      cleanupBootstrapModalArtifacts()
    },
  )
}

app.mount('#app')