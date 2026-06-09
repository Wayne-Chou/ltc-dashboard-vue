import { fetchAssessments, getTimeRange } from '@/api/dashboard'
import { hideGlobalLoading, showGlobalLoading } from '@/utils/globalLoading'
import {
  buildCompareSummaryModel,
  buildSelectedSiteFromAssessments,
  COMPARE_SELECTED_SITES_MAX,
  filterByDates,
  formatDateForCompare,
  getChartHintText,
  toTimestampRange,
} from '@/utils/compareMode'
import { computed, inject, nextTick, reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { DASHBOARD_INJECTION_KEY } from '@/composables/useDashboardData'

export const COMPARE_INJECTION_KEY = Symbol('compareMode')

const dateRangeCache = new Map()

/**
 * Group compare mode state machine.
 */
export function useCompareMode(dashboardOverride) {
  const dashboard = dashboardOverride ?? inject(DASHBOARD_INJECTION_KEY)
  const { t } = useI18n()
  if (!dashboard) {
    throw new Error('useCompareMode() requires dashboard data from DashboardView')
  }

  const view = ref('default')
  const selectedSites = ref([])
  const groupedData = shallowRef(null)
  const compareLoading = ref(false)
  const controlsGeneration = ref(0)
  /** Force remount — legacy innerHTML swap on #appView */
  const defaultViewKey = ref(0)
  const compareViewKey = ref(0)

  let savedMainScrollTop = 0

  function trimSelectedSites() {
    if (selectedSites.value.length > COMPARE_SELECTED_SITES_MAX) {
      selectedSites.value = selectedSites.value.slice(0, COMPARE_SELECTED_SITES_MAX)
    }
  }

  function getSiteName(code) {
    return dashboard.locationMap.value[code]?.name || code
  }

  function siteOptions() {
    return Object.entries(dashboard.locationMap.value || {}).map(([code, site]) => ({
      code,
      name: site.name,
    }))
  }

  async function getAvailableDateRange(siteCode) {
    const { startTime, endTime } = getTimeRange()
    const data = await fetchAssessments(siteCode, startTime, endTime)
    const enabledDates = (data || [])
      .map((d) => formatDateForCompare(new Date(d.Date)))
      .filter(Boolean)
    const sortedDates = [...enabledDates].sort((a, b) => new Date(a) - new Date(b))
    return {
      minDate: sortedDates.length ? sortedDates[0] : null,
      maxDate: sortedDates.length ? sortedDates[sortedDates.length - 1] : null,
      enabledDates,
    }
  }

  async function getCachedDateRange(siteCode) {
    if (dateRangeCache.has(siteCode)) {
      return dateRangeCache.get(siteCode)
    }
    const result = await getAvailableDateRange(siteCode)
    dateRangeCache.set(siteCode, result)
    return result
  }

  async function autoSelectDefaultSites(limit = 2) {
    const { startTime, endTime } = getTimeRange()
    const sites = Object.values(dashboard.locationMap.value || {})
    if (!sites.length) return []

    const rankedSites = await Promise.all(
      sites.map(async (site) => {
        try {
          const data = await fetchAssessments(site.code, startTime, endTime)
          return {
            code: site.code,
            count: Array.isArray(data) ? data.length : 0,
          }
        } catch {
          return { code: site.code, count: 0 }
        }
      }),
    )

    return rankedSites
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .filter((s) => s.count > 0)
      .map((s) => s.code)
  }

  async function makeSelectedSite(code) {
    const { startTime, endTime } = getTimeRange()
    const data = await fetchAssessments(code, startTime, endTime)
    return buildSelectedSiteFromAssessments(code, data)
  }

  async function loadCompareCharts() {
    if (selectedSites.value.length < 2) {
      groupedData.value = null
      return
    }

    compareLoading.value = true
    showGlobalLoading()

    try {
      const grouped = await Promise.all(
        selectedSites.value
          .slice(0, COMPARE_SELECTED_SITES_MAX)
          .filter((site) => site?.code)
          .map(async (site) => {
            let start = site.start
            let end = site.end

            if (site.timeMode === 'multiple' && site.selectedDates?.length) {
              const sorted = [...site.selectedDates].sort()
              start = sorted[0]
              end = sorted[sorted.length - 1]
            }

            const { start: tsStart, end: tsEnd } = toTimestampRange(start, end, site.timeMode)
            let data = await fetchAssessments(site.code, tsStart, tsEnd)

            if (site.timeMode === 'multiple') {
              data = filterByDates(data, site.selectedDates)
            }

            return {
              code: site.code,
              site: getSiteName(site.code),
              data: data || [],
              timeMode: site.timeMode,
              selectedDates: site.selectedDates,
              start: site.start,
              end: site.end,
            }
          }),
      )

      groupedData.value = grouped
    } finally {
      compareLoading.value = false
      hideGlobalLoading()
    }
  }


  async function refreshCompareData() {
    await loadCompareCharts()
  }

  function bumpControls() {
    controlsGeneration.value += 1
  }


  function teardownCompareSession() {
    groupedData.value = null
    bumpControls()
  }

  function captureMainScroll() {
    if (typeof document === 'undefined') return
    const el = document.querySelector('.main-content')
    savedMainScrollTop = el?.scrollTop ?? 0
  }

  function restoreMainScroll() {
    nextTick(() => {
      const el = document.querySelector('.main-content')
      if (el) el.scrollTop = savedMainScrollTop
    })
  }

  async function restoreDefaultView() {
    if (typeof dashboard.reloadRegionData === 'function') {
      await dashboard.reloadRegionData()
    }
  }

  async function renderCompareView() {
    compareViewKey.value += 1
    await initCompareMode()
  }

  async function renderDefaultView() {
    defaultViewKey.value += 1
    teardownCompareSession()
    await restoreDefaultView()
    restoreMainScroll()
  }

  /**
   * Order: header visibility (by view) → flip view → renderView branch
   */
  function toggleCompareMode() {
    const wasCompare = view.value === 'compare'
    view.value = wasCompare ? 'default' : 'compare'

    if (view.value === 'compare') {
      captureMainScroll()
      void renderCompareView()
    } else {
      void renderDefaultView()
    }
  }

  async function initCompareMode() {
    compareLoading.value = true
    showGlobalLoading()

    try {
      selectedSites.value = []
      groupedData.value = null
      bumpControls()

      const defaultCodes = await autoSelectDefaultSites(2)

      if (defaultCodes.length === 1) {
        const site = await makeSelectedSite(defaultCodes[0])
        selectedSites.value = [{ ...site }, { ...site }]
      } else {
        selectedSites.value = await Promise.all(defaultCodes.map((code) => makeSelectedSite(code)))
      }

      trimSelectedSites()
      bumpControls()

      await refreshCompareData()
    } finally {
      compareLoading.value = false
      hideGlobalLoading()
    }
  }

  async function onSiteChange(index, code) {
    selectedSites.value[index] = await makeSelectedSite(code)
    bumpControls()
    await refreshCompareData()
  }

  function onTimeModeChange(index, timeMode) {
    const next = { ...selectedSites.value[index], timeMode }

    if (timeMode === 'single') {
      next.start = next.end || next.start
      next.end = next.end || next.start
    }

    if (timeMode === 'multiple') {
      const lastDate = next.end || next.start
      if (lastDate) {
        next.selectedDates = [lastDate]
        next.start = lastDate
        next.end = lastDate
      } else {
        next.selectedDates = []
      }
    }

    selectedSites.value[index] = next
    bumpControls()
    void refreshCompareData()
  }

  function onRangeSelected(index, startDate, endDate) {
    const site = selectedSites.value[index]
    if (!site) return
    site.start = formatDateForCompare(startDate)
    site.end = formatDateForCompare(endDate)
    void refreshCompareData()
  }

  function onSingleSelected(index, date) {
    const site = selectedSites.value[index]
    if (!site) return
    const d = formatDateForCompare(date)
    site.start = d
    site.end = d
    void refreshCompareData()
  }

  function onMultipleSelected(index, dates) {
    const site = selectedSites.value[index]
    if (!site) return
    site.selectedDates = dates.map((d) => formatDateForCompare(d))
    void refreshCompareData()
  }

  function applyQuickRange(index, type) {
    const site = selectedSites.value[index]
    if (!site) return

    const today = new Date()
    let start
    let end

    if (type === '30d') {
      end = today
      start = new Date()
      start.setDate(today.getDate() - 29)
    } else if (type === '6m') {
      end = today
      start = new Date()
      start.setMonth(today.getMonth() - 6)
      start.setDate(1)
    } else if (type === 'year') {
      const year = today.getFullYear()
      start = new Date(year, 0, 1)
      end = today
    }

    site.timeMode = 'range'
    site.start = formatDateForCompare(start)
    site.end = formatDateForCompare(end)
    site.selectedDates = []

    bumpControls()
    void refreshCompareData()
  }

  function clearSiteDates(index) {
    const site = selectedSites.value[index]
    if (!site) return
    site.start = ''
    site.end = ''
    site.selectedDates = []
    bumpControls()
    void refreshCompareData()
  }

  function rangeDisplayValue(site) {
    if (site.start && site.end) {
      return `${site.start} ~ ${site.end}`
    }
    return ''
  }

  function singleDisplayValue(site) {
    return site.end || site.start || ''
  }

  function multipleDisplayValue(site) {
    return Array.isArray(site.selectedDates) ? site.selectedDates.join(', ') : ''
  }

  /**
   * Reactive store — getters unwrap correctly via inject in templates.
   */
  const compareMode = reactive({
    view,
    defaultViewKey,
    compareViewKey,
    selectedSites,
    groupedData,
    compareLoading,
    controlsGeneration,

    get isCompareMode() {
      return view.value === 'compare'
    },

    get showRegionDropdown() {
      return view.value === 'default'
    },

    get showHideOnAllNav() {
      return view.value === 'default'
    },

    get compareBtnLabel() {
      return view.value === 'compare'
        ? t('dashboard.backToDefault')
        : t('dashboard.compareMode')
    },

    get compareBtnActive() {
      return view.value === 'compare'
    },

    get compareSummary() {
      return buildCompareSummaryModel(groupedData.value)
    },

    get chartHint() {
      const text = getChartHintText(selectedSites.value)
      return text || null
    },

    get hasCompareCharts() {
      if (!groupedData.value) return false
      return groupedData.value.some((g) => Array.isArray(g.data) && g.data.length > 0)
    },

    get compareChartsNoData() {
      if (selectedSites.value.length < 2) return true
      if (!groupedData.value) return true
      return !groupedData.value.some((g) => Array.isArray(g.data) && g.data.length > 0)
    },

    get compareNoDataMessage() {
      if (selectedSites.value.length < 2) return null
      if (groupedData.value && !groupedData.value.some((g) => Array.isArray(g.data) && g.data.length > 0)) {
        return '此日期區間無資料'
      }
      return null
    },

    toggleCompareMode,
    initCompareMode,
    refreshCompareData,
    loadCompareCharts,
    onSiteChange,
    onTimeModeChange,
    onRangeSelected,
    onSingleSelected,
    onMultipleSelected,
    applyQuickRange,
    clearSiteDates,
    getCachedDateRange,
    getSiteName,
    siteOptions,
    rangeDisplayValue,
    singleDisplayValue,
    multipleDisplayValue,
  })

  return compareMode
}

export function useCompareModeInject() {
  const compare = inject(COMPARE_INJECTION_KEY)
  if (!compare) {
    throw new Error('useCompareModeInject() must be used within DashboardView')
  }
  return compare
}
