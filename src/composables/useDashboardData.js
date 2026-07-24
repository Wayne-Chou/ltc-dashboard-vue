import { fetchAssessments, fetchSites, getTimeRange } from '@/api/dashboard'
import {
  buildLocationMapFromSites,
  computeOverviewSummary,
  computeRiskStats,
  computeSelectionSummary,
} from '@/utils/dashboardStats'
import {
  getToken,
  isUnauthorizedError,
} from '@/utils/authSession'
import { redirectLogin } from '@/services/authService'
import { cleanupBootstrapModalArtifacts } from '@/utils/bootstrapCleanup'
import { hideGlobalLoading, showGlobalLoading } from '@/utils/globalLoading'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

export const DASHBOARD_INJECTION_KEY = Symbol('dashboardData')

export function useDashboardData() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const sites = ref([])
  const assessments = ref([])
  const dateRange = ref(null) 
  const selectedIndices = ref([])
  const error = ref(null)
  const locationMap = ref({})
  const siteStatsMap = ref({})
  const locationMapReady = ref(false)

  const regionId = computed(() => {
    const region = route.query.region
    if (!region || region === '0') return '0'
    return String(region)
  })

  const isOverviewMode = computed(() => regionId.value === '0')

  const showRegionSections = computed(() => !isOverviewMode.value)

  const showLocationSiteCard = computed(() => isOverviewMode.value)

  const dateFilteredAssessments = computed(() => {
    if (!dateRange.value) return assessments.value
    const { start, end } = dateRange.value
    return assessments.value.filter((item) => {
      if (!item?.Date) return false
      const itemDate = new Date(item.Date)
      return itemDate >= start && itemDate <= end
    })
  })

  const selectedAssessments = computed(() =>
    dateFilteredAssessments.value.filter((_, index) =>
      selectedIndices.value.includes(index),
    ),
  )

  const overviewSummary = computed(() =>
    computeOverviewSummary(siteStatsMap.value, sites.value),
  )

  const selectionSummary = computed(() =>
    computeSelectionSummary(selectedAssessments.value, t),
  )

  const summary = computed(() => {
    if (isOverviewMode.value) {
      return overviewSummary.value
    }
    return {
      ...selectionSummary.value,
      locationCount: 0,
      locationList: '',
    }
  })

  const riskStats = computed(() => computeRiskStats(selectedAssessments.value))

  const hasNoData = computed(() => {
    if (isOverviewMode.value) {
      return false
    }
    if (!assessments.value.length) {
      return true
    }
    if (dateRange.value && dateFilteredAssessments.value.length === 0) {
      return true
    }
    return selectedAssessments.value.length === 0
  })

  const showSummaryDateSubtitles = computed(() => !isOverviewMode.value)

  function applyAssessments(data) {
    const list = Array.isArray(data) ? data : []
    assessments.value = list
    dateRange.value = null

    if (list.length > 0) {
      selectedIndices.value = list.map((_, index) => index)
    } else {
      selectedIndices.value = []
    }
  }

  function setSelectedIndices(indices) {
    selectedIndices.value = [...indices]
  }

  function toggleSelection(index) {
    const next = selectedIndices.value.includes(index)
      ? selectedIndices.value.filter((item) => item !== index)
      : [...selectedIndices.value, index]
    setSelectedIndices(next)
  }

  function selectAllAssessments() {
    setSelectedIndices(dateFilteredAssessments.value.map((_, index) => index))
  }

  function unselectAllAssessments() {
    setSelectedIndices([])
  }

  function setDateRange(start, end) {
    dateRange.value = { start, end }
    selectAllAssessments()
  }

  function clearDateFilter() {
    dateRange.value = null
    selectAllAssessments()
  }

  function buildMapsFromSites(siteList) {
    const maps = buildLocationMapFromSites(siteList)
    locationMap.value = maps.locationMap
    siteStatsMap.value = maps.siteStatsMap
    locationMapReady.value = true
  }

  async function loadOverviewRegion() {
    applyAssessments([])
  }

  async function loadSiteRegion(code) {
    const { startTime, endTime } = getTimeRange()
    const data = await fetchAssessments(code, startTime, endTime)
    applyAssessments(data)
  }

  async function initLocationPage() {
    error.value = null
    showGlobalLoading()

    try {
      if (!getToken()) {
        redirectLogin({ redirect: route.fullPath, expired: false })
        return
      }
      const siteList = await fetchSites()
      sites.value = siteList
      buildMapsFromSites(siteList)

      if (isOverviewMode.value) {
        await loadOverviewRegion()
      } else if (locationMap.value[regionId.value]) {
        const loc = locationMap.value[regionId.value]
        await loadSiteRegion(loc.code)
      } else {
        applyAssessments([])
      }
    } catch (err) {
      if (isUnauthorizedError(err)) return
      error.value = err
      console.error('[Dashboard] init failed:', err)
    } finally {
      hideGlobalLoading()
    }
  }

  function selectRegion(code) {
    router.push({
      query: {
        ...route.query,
        region: String(code),
      },
    })
  }

  watch(
    () => route.query.region,
    () => {
      cleanupBootstrapModalArtifacts()
      if (sites.value.length > 0) {
        void reloadRegionData()
      }
    },
  )

  async function reloadRegionData() {
    error.value = null
    showGlobalLoading()

    try {
      if (isOverviewMode.value) {
        await loadOverviewRegion()
      } else if (locationMap.value[regionId.value]) {
        const loc = locationMap.value[regionId.value]
        await loadSiteRegion(loc.code)
      } else {
        applyAssessments([])
      }
    } catch (err) {
      if (isUnauthorizedError(err)) return
      error.value = err
    } finally {
      hideGlobalLoading()
    }
  }

  onMounted(() => {
    void initLocationPage()
  })

  return {
    sites,
    assessments,
    dateRange,
    dateFilteredAssessments,
    selectedIndices,
    selectedAssessments,
    error,
    locationMap,
    siteStatsMap,
    locationMapReady,
    regionId,
    isOverviewMode,
    showRegionSections,
    showLocationSiteCard,
    showSummaryDateSubtitles,
    summary,
    riskStats,
    hasNoData,
    applyAssessments,
    setSelectedIndices,
    toggleSelection,
    selectAllAssessments,
    unselectAllAssessments,
    setDateRange,
    clearDateFilter,
    selectRegion,
    initLocationPage,
    reloadRegionData,
  }
}

export function useDashboardDataInject() {
  const dashboard = inject(DASHBOARD_INJECTION_KEY)
  if (!dashboard) {
    throw new Error('useDashboardDataInject() must be used within DashboardView')
  }
  return dashboard
}
