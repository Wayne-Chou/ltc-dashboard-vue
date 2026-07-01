<script setup>
import WalkingAssessmentCardList from '@/components/walking/dashboard/WalkingAssessmentCardList.vue'
import WalkingKioskAnnouncementEditor from '@/components/walking/dashboard/WalkingKioskAnnouncementEditor.vue'
import WalkingLocationPlaceholder from '@/components/walking/dashboard/WalkingLocationPlaceholder.vue'
import WalkingParticipantsPanel from '@/components/walking/dashboard/WalkingParticipantsPanel.vue'
import WalkingParticipantsViewAllModal from '@/components/walking/dashboard/WalkingParticipantsViewAllModal.vue'
import WalkingSidebar from '@/components/walking/dashboard/WalkingSidebar.vue'
import WalkingSummarySection from '@/components/walking/dashboard/WalkingSummarySection.vue'
import WalkingTrendChartsSection from '@/components/walking/dashboard/WalkingTrendChartsSection.vue'
import '@/styles/dashboard.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const regionOptions = [
  { value: '0', label: '總表' },
  { value: '1', label: '台北中心' },
  { value: '2', label: '新北據點' },
]

const selectedRegion = computed(() => {
  const region = route.query.region
  if (!region || region === '0') return '0'
  return String(region)
})
const isCollapsed = ref(false)
const isKioskView = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}img/logo.png`

const regionLabel = computed(
  () =>
    regionOptions.find((item) => item.value === selectedRegion.value)?.label ??
    '總表',
)

const showRegionSections = computed(() => selectedRegion.value !== '0')

const summaryColClass = computed(() =>
  showRegionSections.value ? 'col-md-6' : 'col-md-4',
)

const navItems = [
  { href: '#summary', label: '檢測統計摘要' },

  { href: '#trend', label: '群體變化趨勢' },
  { href: '#status', label: '參與者狀態' },
  { href: '#location', label: '檢測據點分布' },
]

const summaryStats = {
  totalPeople: 128,
  totalVisits: 356,
  locationCount: 3,
  startDateText: '起始：2024/10/15',
  latestDateText: '最新：2025/04/02',
  locationList: '台北中心、新北據點、桃園據點',
}

const riskStatsData = {
  alertGaitSpeed: 12,
  alertChairSecond: 8,
  alertA: 1,
  alertB: 1,
  alertC: 1,
  gaitSpeedDeclineCount: 12,
  chairSecondIncreaseCount: 8,
  progressGaitSpeed: '35%',
  progressChair: '24%',
  countA: 1,
  countB: 1,
  countC: 1,
  countD: 1,
  progressA: '25%',
  progressB: '25%',
  progressC: '25%',
  progressD: '25%',
}

const assessmentRecords = [
  { date: '2025/01/12', gaitSpeed: 92, count: 28 },
  { date: '2025/02/08', gaitSpeed: 88, count: 31 },
  { date: '2025/03/15', gaitSpeed: 95, count: 24 },
  { date: '2025/04/02', gaitSpeed: 90, count: 27 },
]

const selectedAssessmentIndices = ref([0, 1, 2, 3])

const participants = [
  {
    Name: '王○明',
    Age: 72,
    Gender: 1,
    Risk: 42,
    Level: 'B',
    Date: '2025-04-02',
    Number: 1,
  },
  {
    Name: '李○華',
    Age: 68,
    Gender: 0,
    Risk: 18,
    Level: 'C',
    Date: '2025-04-02',
    Number: 2,
  },
  {
    Name: '張○強',
    Age: 75,
    Gender: 1,
    Risk: 55,
    Level: 'A',
    Date: '2025-03-15',
    Number: 3,
  },
  {
    Name: '陳○美',
    Age: 70,
    Gender: 0,
    Risk: 8,
    Level: 'D',
    Date: '2025-03-15',
    Number: 4,
  },
]

const riskFilter = ref('all')

const riskFilters = [
  { value: 'all', label: '全部', btnClass: 'btn-secondary' },
  { value: 'high', label: '高危險', btnClass: 'btn-danger risk-high-danger' },
  { value: 'slightlyHigh', label: '高風險', btnClass: 'btn-warning risk-high' },
  { value: 'medium', label: '中風險', btnClass: 'btn-warning risk-medium' },
  {
    value: 'slightlyLow',
    label: '偏低',
    btnClass: 'btn-success risk-slightly-low',
  },
  { value: 'low', label: '低風險', btnClass: 'btn-success risk-low' },
]

const riskFilterCounts = computed(() => {
  const counts = {
    all: 0,
    high: 0,
    slightlyHigh: 0,
    medium: 0,
    slightlyLow: 0,
    low: 0,
  }
  participants.forEach((person) => {
    counts.all += 1
    const category = getRiskCategory(person.Risk)
    counts[category] += 1
  })
  return counts
})

const filteredParticipants = computed(() => {
  if (riskFilter.value === 'all') return participants
  return participants.filter(
    (person) => getRiskCategory(person.Risk) === riskFilter.value,
  )
})

const overviewText = computed(
  () => `共 ${filteredParticipants.value.length} 位參與者`,
)

const isAllMode = computed(() => riskFilter.value === 'all')

const announcementTitle = ref('')
const announcementContent = ref('')

const walkingParticipantsViewAllOpen = ref(false)
const walkingParticipantsViewAllInitialFilter = ref('all')

function isAssessmentSelected(index) {
  return selectedAssessmentIndices.value.includes(index)
}

function toggleAssessmentSelection(index) {
  if (isAssessmentSelected(index)) {
    selectedAssessmentIndices.value = selectedAssessmentIndices.value.filter(
      (item) => item !== index,
    )
  } else {
    selectedAssessmentIndices.value = [
      ...selectedAssessmentIndices.value,
      index,
    ]
  }
}

function selectAllAssessments() {
  selectedAssessmentIndices.value = assessmentRecords.map((_, index) => index)
}

function unselectAllAssessments() {
  selectedAssessmentIndices.value = []
}

function getRiskCategory(risk) {
  if (risk > 50) return 'high'
  if (risk > 30) return 'slightlyHigh'
  if (risk > 17.5) return 'medium'
  if (risk > 5) return 'slightlyLow'
  return 'low'
}

function setRiskFilter(value) {
  riskFilter.value = value
}

function openWalkingParticipantsViewAll(filter) {
  walkingParticipantsViewAllInitialFilter.value = filter
  walkingParticipantsViewAllOpen.value = true
}

function onSaveAnnouncement() {
  window.alert('Demo 頁面：儲存功能未串接')
}

function onSelectRegion(value) {
  router.push({
    query: {
      ...route.query,
      region: String(value),
    },
  })
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function toggleKioskView() {
  isKioskView.value = !isKioskView.value
}

function onSelectPerson(person) {
  if (!person?.Number) return
  router.push({
    name: 'walking-person-detail',
    params: { id: String(person.Number) },
  })
}

function onLogout() {
  window.alert('Demo 頁面：登出功能未串接')
}
</script>

<template>
  <div class="custom-container content bg-white">
    <div class="page-wrapper">
      <WalkingSidebar
        :is-collapsed="isCollapsed"
        :logo-src="logoSrc"
        :region-label="regionLabel"
        :region-options="regionOptions"
        :is-kiosk-view="isKioskView"
        :nav-items="navItems"
        @toggle-sidebar="toggleSidebar"
        @select-region="onSelectRegion"
        @toggle-kiosk="toggleKioskView"
        @logout="onLogout"
      />

      <div class="main-content">
        <WalkingSummarySection
          v-if="!isKioskView"
          :show-region-sections="showRegionSections"
          :summary-col-class="summaryColClass"
          :summary-stats="summaryStats"
        />

        <WalkingAssessmentCardList
          v-if="!isKioskView && showRegionSections"
          :assessment-records="assessmentRecords"
          :selected-assessment-indices="selectedAssessmentIndices"
          @toggle-selection="toggleAssessmentSelection"
          @select-all="selectAllAssessments"
          @unselect-all="unselectAllAssessments"
        />

        <WalkingTrendChartsSection
          v-if="!isKioskView && showRegionSections"
        />

        <WalkingParticipantsPanel
          v-if="!isKioskView && showRegionSections"
          :risk-filters="riskFilters"
          :risk-filter="riskFilter"
          :risk-filter-counts="riskFilterCounts"
          :filtered-participants="filteredParticipants"
          :overview-text="overviewText"
          :is-all-mode="isAllMode"
          @set-risk-filter="setRiskFilter"
          @select-person="onSelectPerson"
          @open-view-all="openWalkingParticipantsViewAll"
        />

        <WalkingParticipantsViewAllModal
          v-if="!isKioskView && showRegionSections"
          v-model="walkingParticipantsViewAllOpen"
          mode="risk"
          :participants="participants"
          :initial-filter="walkingParticipantsViewAllInitialFilter"
          @select-person="onSelectPerson"
        />

        <WalkingLocationPlaceholder v-if="!isKioskView" />

        <WalkingKioskAnnouncementEditor
          v-if="isKioskView"
          :announcement-title="announcementTitle"
          :announcement-content="announcementContent"
          @update:announcement-title="announcementTitle = $event"
          @update:announcement-content="announcementContent = $event"
          @save="onSaveAnnouncement"
        />
      </div>
    </div>
  </div>
</template>
