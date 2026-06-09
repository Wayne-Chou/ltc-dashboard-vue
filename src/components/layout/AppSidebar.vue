<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import { useCompareModeInject } from '@/composables/useCompareMode'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  sites: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-region'])

const { t } = useI18n()
const compare = useCompareModeInject()
const isCollapsed = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}img/logo.png`

const navItems = [
  { href: '#summary', labelKey: 'dashboard.navSummary' },
  { href: '#risk', labelKey: 'dashboard.navRisk' },
  { href: '#trend', labelKey: 'dashboard.navTrend' },
  { href: '#status', labelKey: 'dashboard.navStatus' },
  { href: '#location', labelKey: 'dashboard.navLocation' },
]

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside id="mySidebar" class="sidebar" :class="{ collapsed: isCollapsed }">
    <button
      id="sidebarToggle"
      type="button"
      class="btn btn-primary shadow-sm"
      :aria-label="t('dashboard.toggleSidebar')"
      @click="toggleSidebar"
    >
      <i id="toggleIcon" class="bi bi-chevron-left" :class="{ 'rotate-180': isCollapsed }"></i>
    </button>

    <div class="sidebar-inner-content">
      <div class="text-center mt-3 mb-2">
        <img
          style="max-width: 150px; height: auto"
          :src="logoSrc"
          :alt="t('dashboard.companyName')"
        />
      </div>

      <AppHeader :sites="sites" @select-region="(code) => emit('select-region', code)" />

      <nav
        v-if="compare.showHideOnAllNav"
        class="navbar navbar-expand-lg bg-white shadow-sm sticky-top border-bottom hide-on-all"
      >
        <div class="container-fluid">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            :aria-label="t('dashboard.toggleNav')"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div id="mainNavbar" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li v-for="item in navItems" :key="item.href" class="nav-item">
                <a class="nav-link fw-bold text-dark" :href="item.href">
                  {{ t(item.labelKey) }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>
