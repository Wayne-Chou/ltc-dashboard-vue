import { fetchPersonDetail } from '@/api/person'
import { fetchSites } from '@/api/dashboard'
import {
  buildComparePanelHint,
  buildHeadlineFromAssessments,
  calculateTrend,
  convertToAssessments,
  getLatestClinicalStatus,
} from '@/utils/personDetail'
import {
  getToken,
  isUnauthorizedError,
} from '@/utils/authSession'
import { redirectLogin } from '@/services/authService'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

/**
 * Person detail page state.
 */
export function usePersonDetail() {
  const route = useRoute()
  const router = useRouter()
  const { t, tm, locale } = useI18n()

  const loading = ref(true)
  const error = ref(null)
  const notFound = ref(false)
  const profile = ref(null)
  const allRecords = ref([])
  const flatpickrRange = ref(null)
  const selectedIndices = ref([])

  const personId = computed(() => String(route.params.id || ''))
  const regionParam = computed(() => String(route.query.region || '0'))

  const displayedRecords = computed(() => {
    const records = allRecords.value
    const range = flatpickrRange.value
    if (!range) return records

    const endDate = new Date(range.end)
    endDate.setHours(23, 59, 59, 999)

    return records.filter((record) => {
      if (!record?.Date) return false
      const dDate = new Date(record.Date)
      return dDate >= range.start && dDate <= endDate
    })
  })

  const selectedRecords = computed(() =>
    selectedIndices.value
      .map((index) => displayedRecords.value[index])
      .filter(Boolean),
  )

  const selectedAssessments = computed(() => convertToAssessments(selectedRecords.value))

  const allAssessments = computed(() => convertToAssessments(allRecords.value))

  const compareRecords = computed(() =>
    [...selectedRecords.value]
      .filter((item) => item?.Date)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
      .slice(-2),
  )

  const trend = computed(() => {
    if (compareRecords.value.length < 2) return null
    return calculateTrend(convertToAssessments(compareRecords.value))
  })

  const headline = computed(() => buildHeadlineFromAssessments(allAssessments.value))

  const headlineClinicalStatus = computed(() => getLatestClinicalStatus(allAssessments.value))

  const hasChartData = computed(() => selectedAssessments.value.length > 0)

  const comparePanelHint = computed(() => {
    void locale.value
    const hintLang = tm('personDetail.tableHint')
    return buildComparePanelHint(
      selectedRecords.value,
      compareRecords.value,
      hintLang,
    )
  })

  const recordPanelHint = computed(() => {
    void locale.value
    return t('personDetail.panelRecordHint')
  })

  function syncSelectedIndices(records) {
    selectedIndices.value = records.map((_, index) => index)
  }

  async function resolveRegionCode() {
    const param = regionParam.value
    if (!param || param === '0') return null

    try {
      const sites = await fetchSites()
      const matched = sites.find((site) => String(site.Code) === param)
      return matched?.Code ?? param
    } catch {
      return param
    }
  }

  async function loadPerson() {
    loading.value = true
    error.value = null
    notFound.value = false

    try {
      if (!getToken()) {
        redirectLogin({ redirect: route.fullPath, expired: false })
        return
      }
      const regionCode = await resolveRegionCode()
      if (!personId.value || !regionCode) {
        throw new Error(t('personDetail.loadFailed'))
      }

      const data = await fetchPersonDetail(regionCode, personId.value)
      if (!data?.Profile) {
        notFound.value = true
        profile.value = null
        allRecords.value = []
        selectedIndices.value = []
        return
      }

      profile.value = data.Profile
      allRecords.value = Array.isArray(data.Datas) ? data.Datas : []
      syncSelectedIndices(allRecords.value)
    } catch (err) {
      if (isUnauthorizedError(err)) return
      error.value = err
      console.error('[PersonDetail] load failed:', err)
    } finally {
      loading.value = false
    }
  }

  function toggleRecord(index, checked) {
    if (checked) {
      if (!selectedIndices.value.includes(index)) {
        selectedIndices.value = [...selectedIndices.value, index].sort((a, b) => a - b)
      }
    } else {
      selectedIndices.value = selectedIndices.value.filter((item) => item !== index)
    }
  }

  function selectAllRecords() {
    syncSelectedIndices(displayedRecords.value)
  }

  function unselectAllRecords() {
    selectedIndices.value = []
  }

  function setDateRange(start, end) {
    flatpickrRange.value = { start, end }
  }

  function clearDateFilter() {
    flatpickrRange.value = null
    syncSelectedIndices(allRecords.value)
  }

  function goBack() {
    const returnUrl = route.query.returnUrl
    if (typeof returnUrl === 'string' && returnUrl) {
      router.push(decodeURIComponent(returnUrl))
      return
    }
    router.push({ name: 'dashboard', query: { region: regionParam.value } })
  }

  watch(
    () => [route.params.id, route.query.region],
    () => {
      flatpickrRange.value = null
      void loadPerson()
    },
    { immediate: true },
  )

  watch(displayedRecords, (records) => {
    syncSelectedIndices(records)
  })

  return {
    loading,
    error,
    notFound,
    profile,
    allRecords,
    displayedRecords,
    selectedIndices,
    selectedRecords,
    selectedAssessments,
    trend,
    headline,
    headlineClinicalStatus,
    hasChartData,
    comparePanelHint,
    recordPanelHint,
    personId,
    regionParam,
    toggleRecord,
    selectAllRecords,
    unselectAllRecords,
    setDateRange,
    clearDateFilter,
    goBack,
    loadPerson,
  }
}
