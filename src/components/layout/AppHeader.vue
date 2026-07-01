<script setup>
import { useCompareModeInject } from '@/composables/useCompareMode'
import { isCompareModeEnabled } from '@/utils/featureFlags'
import { useAppStore } from '@/stores/app'
import { logoutApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  sites: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-region'])

const compare = useCompareModeInject()
const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const regionLabel = computed(() => {
  const region = route.query.region
  if (!region || region === '0') {
    return t('dashboard.overview')
  }
  const site = props.sites.find((item) => String(item.Code) === String(region))
  return site?.Name ?? t('dashboard.overview')
})

const localeOptions = [
  { value: 'zh', labelKey: 'dashboard.langZh' },
  { value: 'en', labelKey: 'dashboard.langEn' },
  { value: 'ja', labelKey: 'dashboard.langJa' },
]

function onSelectOverview(event) {
  event.preventDefault()
  emit('select-region', '0')
}

function onSelectSite(event, code) {
  event.preventDefault()
  emit('select-region', code)
}

function onSwitchLocale(value) {
  appStore.setLocale(value)
}

async function onLogout() {
  const token = authStore.token
  try {
    await logoutApi(token)
  } finally {
    authStore.logout()
    await router.replace({ name: 'login', query: {} })
  }
}
</script>

<template>
  <header class="custom-header mt-4 mb-4">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h1 class="custom-title h3 h2-md h1-lg mb-1">
          {{ t('dashboard.dashboardTitle') }}
        </h1>
      </div>
    </div>

  
    <div
      
    >
      <div v-if="compare.showRegionDropdown" class="header-region dropdown">
        <button
          id="dropdownMenuButton"
          class="btn btn-primary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {{ regionLabel }}
        </button>

        <ul id="dropdownMenu" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li>
            <a class="dropdown-item" href="#" @click="onSelectOverview">
              {{ t('dashboard.overview') }}
            </a>
          </li>
          <li v-for="site in sites" :key="site.Code">
            <a class="dropdown-item" href="#" @click="onSelectSite($event, site.Code)">
              {{ site.Name }}
            </a>
          </li>
        </ul>
      </div>

      <div class="header-actions ">
        <div class="dropdown">
          <button
            id="languageMenu"
            class="btn btn-outline-primary fw-bold mt-2 mb-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ t('dashboard.language') }}
          </button>

          <ul
            class="dropdown-menu dropdown-menu-end shadow-sm"
            aria-labelledby="languageMenu"
          >
            <li v-for="opt in localeOptions" :key="opt.value">
              <button
                class="dropdown-item"
                type="button"
                @click="onSwitchLocale(opt.value)"
              >
                {{ t(opt.labelKey) }}
              </button>
            </li>
          </ul>
        </div>

        <button id="logoutBtn" class="btn btn-primary mt-2 mb-2" type="button" @click="onLogout">
          {{ t('dashboard.logout') }}
        </button>
      </div>

      <div
        v-if="isCompareModeEnabled"
        class="compareBtn"
        :class="{ active: compare.compareBtnActive }"
      >
        <button
          id="compareBtn"
          type="button"
          class="btn btn-outline-primary"
          :aria-pressed="compare.compareBtnActive"
          @click="compare.toggleCompareMode"
        >
          <i class="bi bi-intersect me-1" />
          <span>{{ compare.compareBtnLabel }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
