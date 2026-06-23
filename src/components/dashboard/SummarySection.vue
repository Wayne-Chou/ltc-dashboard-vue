<script setup>
import { useDashboardDataInject } from '@/composables/useDashboardData'
import flatpickr from 'flatpickr'
import { Japanese } from 'flatpickr/dist/l10n/ja.js'
import { MandarinTraditional } from 'flatpickr/dist/l10n/zh-tw.js'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import 'flatpickr/dist/flatpickr.min.css'

const { t, locale } = useI18n()
const {
  summary,
  showLocationSiteCard,
  showSummaryDateSubtitles,
  isOverviewMode,
  setDateRange,
  clearDateFilter,
} = useDashboardDataInject()

const dateRangeInputRef = ref(null)
let flatpickrInstance = null

function getFlatpickrLocale(lang) {
  const l = (lang || 'zh').toLowerCase()
  if (l.includes('zh')) return MandarinTraditional
  if (l.includes('ja')) return Japanese
  return undefined
}

function destroyFlatpickr() {
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
}

function initFlatpickr() {
  if (!dateRangeInputRef.value || isOverviewMode.value) return
  destroyFlatpickr()

  flatpickrInstance = flatpickr(dateRangeInputRef.value, {
    mode: 'range',
    dateFormat: 'Y-m-d',
    locale: getFlatpickrLocale(locale.value),
    onChange(selectedDates) {
      if (selectedDates.length === 2) {
        setDateRange(selectedDates[0], selectedDates[1])
      }
    },
  })
}

function onClearDateFilter() {
  clearDateFilter()
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
}

onMounted(() => {
  void nextTick(() => initFlatpickr())
})

watch(isOverviewMode, (overview) => {
  if (overview) {
    destroyFlatpickr()
  } else {
    void nextTick(() => initFlatpickr())
  }
})

watch(
  () => locale.value,
  () => {
    if (flatpickrInstance) {
      flatpickrInstance.set('locale', getFlatpickrLocale(locale.value))
    }
  },
)

onBeforeUnmount(() => {
  destroyFlatpickr()
})
</script>

<template>
  <div class="mt-4 mb-4 bg-white p-4 rounded shadow compare-hide">
    <h5 id="summary" class="fw-bold text-dark mb-3 d-flex align-items-center">
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>{{ t('dashboard.summary') }}</span>
    </h5>

    <div v-if="!isOverviewMode" class="my-3 hide-on-all">
      <div class="input-group">
        <input
          ref="dateRangeInputRef"
          type="text"
          class="form-control"
          :placeholder="t('dashboard.selectDateRange')"
        />
        <button
          class="btn btn-outline-secondary"
          type="button"
          @click="onClearDateFilter"
        >
          {{ t('dashboard.clear') }}
        </button>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4" :class="isOverviewMode ? 'main-col' : 'main-col col-md-6'">
        <div class="stat-card stat-blue h-100">
          <h6 class="fw-semibold mb-2">{{ t('dashboard.totalTestedPeople') }}</h6>
          <div class="d-flex align-items-end">
            <span id="totalCount" class="display-6 fw-bold text-blue">{{ summary.totalCount }}</span>
            <span class="ms-2 mb-1 text-blue">{{ t('dashboard.unitPeople') }}</span>
          </div>
          <p
            v-if="showSummaryDateSubtitles && summary.startDateText"
            id="startDateText"
            class="small mt-2 text-blue"
          >
            {{ summary.startDateText }}
          </p>
          <p v-else class="small mt-2 invisible">placeholder</p>
        </div>
      </div>

      <div class="col-md-4" :class="isOverviewMode ? 'main-col' : 'main-col col-md-6'">
        <div class="stat-card stat-green h-100">
          <h6 class="fw-semibold mb-2">{{ t('dashboard.totalTestVisits') }}</h6>
          <div class="d-flex align-items-end">
            <span id="latestCount" class="display-6 fw-bold text-green">{{ summary.latestCount }}</span>
            <span class="ms-2 mb-1 text-green">{{ t('dashboard.unitVisits') }}</span>
          </div>
          <p
            v-if="showSummaryDateSubtitles && summary.latestDateText"
            id="latestDate"
            class="small mt-2 text-green"
          >
            {{ summary.latestDateText }}
          </p>
          <p v-else class="small mt-2 invisible">placeholder</p>
        </div>
      </div>

      <div v-if="showLocationSiteCard" class="col-md-4 sechide">
        <div class="stat-card stat-purple h-100">
          <h6 class="fw-semibold mb-2">{{ t('dashboard.locationSiteCount') }}</h6>
          <div class="d-flex align-items-end">
            <span id="locationCount" class="display-6 fw-bold text-purple">{{
              summary.locationCount
            }}</span>
            <span class="ms-2 mb-1 text-purple">{{ t('dashboard.unitPlaces') }}</span>
          </div>
          <p v-if="summary.locationList" id="locationList" class="small mt-2 text-purple">
            {{ summary.locationList }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
