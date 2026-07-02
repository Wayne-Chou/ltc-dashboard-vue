<script setup>
import { useGoogleMap } from '@/composables/useGoogleMap'
import { useDashboardDataInject } from '@/composables/useDashboardData'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te, locale } = useI18n()
const { locationMap, locationMapReady, regionId, isOverviewMode } = useDashboardDataInject()

const mapContainerRef = ref(null)

const assessedCountLabel = computed(() => t('dashboard.assessedCount'))

function translateSiteName(code, fallbackName) {
  const key = `dashboard.locations.${code}`
  if (te(key)) {
    return t(key)
  }
  const nameKey = `dashboard.locations.${fallbackName}`
  if (te(nameKey)) {
    return t(nameKey)
  }
  return fallbackName
}

const { loadError } = useGoogleMap({
  mapContainerRef,
  locationMap,
  locationMapReady,
  regionId,
  isOverviewMode,
  locale,
  translateSiteName,
  assessedCountLabel,
})

</script>

<template>
  <section class="mb-4">
    <h5
      id="location"
      class="fw-bold text-dark mb-3 d-flex align-items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="me-2 text-primary"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span>{{ t('dashboard.locationDistribution') }}</span>
    </h5>

    <p
      v-if="loadError"
      class="alert alert-warning small mb-2"
      role="alert"
    >
      {{ loadError.message || String(loadError) }}
    </p>

   
    <div
      v-show="locationMapReady"
      id="map"
      ref="mapContainerRef"
    />
  </section>
</template>
