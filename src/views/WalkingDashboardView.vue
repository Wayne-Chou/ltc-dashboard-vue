<script setup>
import '@/styles/dashboard.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { downloadChartAsPng } from '@/utils/downloadChart'
import Chart from 'chart.js/auto'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const systemTitle = 'LTC 步行能力儀表板'
const systemSubtitle = '長照據點步行監測管理系統'

const regionOptions = [
  { value: '0', label: '總表' },
  { value: '1', label: '台北中心' },
  { value: '2', label: '新北據點' },
]

const selectedRegion = ref('0')
const isCollapsed = ref(false)
const logoSrc = `${import.meta.env.BASE_URL}img/logo.png`

const regionLabel = computed(
  () => regionOptions.find((item) => item.value === selectedRegion.value)?.label ?? '總表',
)

const navItems = [
  { href: '#summary', label: '檢測統計摘要' },
  { href: '#history', label: '歷次檢測' },
  { href: '#trend', label: '群體變化趨勢' },
  { href: '#status', label: '參與者狀態' },
  { href: '#kiosk', label: '一體機公告' },
]

const summaryStats = {
  totalPeople: 128,
  totalVisits: 356,
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

const sortMode = ref('risk')
const riskFilter = ref('all')
const levelFilter = ref('all')

const riskFilters = [
  { value: 'all', label: '全部', btnClass: 'btn-secondary' },
  { value: 'high', label: '高危險', btnClass: 'btn-danger risk-high-danger' },
  { value: 'slightlyHigh', label: '高風險', btnClass: 'btn-warning risk-high' },
  { value: 'medium', label: '中風險', btnClass: 'btn-warning risk-medium' },
  { value: 'slightlyLow', label: '偏低', btnClass: 'btn-success risk-slightly-low' },
  { value: 'low', label: '低風險', btnClass: 'btn-success risk-low' },
]

const levelFilters = [
  { value: 'all', label: '全部', btnClass: 'btn-secondary' },
  { value: 'A', label: 'A 級', btnClass: 'btn-danger risk-high-danger' },
  { value: 'B', label: 'B 級', btnClass: 'btn-warning risk-high' },
  { value: 'C', label: 'C 級', btnClass: 'btn-warning risk-medium' },
  { value: 'D', label: 'D 級', btnClass: 'btn-success risk-low' },
]

const riskStyles = {
  high: { face: '#ff5757', border: '#dc3545' },
  slightlyHigh: { face: '#ffa203', border: '#fd7e14' },
  medium: { face: '#ffd039', border: '#ffc107' },
  slightlyLow: { face: '#8cff00', border: '#28a745' },
  low: { face: '#4ffa00', border: '#198754' },
}

const levelStyles = {
  A: { face: '#FEE2E2', border: '#dc3545', label: 'A 級' },
  B: { face: '#FEF3C7', border: '#fd7e14', label: 'B 級' },
  C: { face: '#DBEAFE', border: '#0d6efd', label: 'C 級' },
  D: { face: '#DCFCE7', border: '#28a745', label: 'D 級' },
}

const riskLabelMap = {
  high: '高風險',
  slightlyHigh: '偏高',
  medium: '中風險',
  slightlyLow: '偏低',
  low: '低風險',
}

const riskFilterCounts = computed(() => {
  const counts = { all: 0, high: 0, slightlyHigh: 0, medium: 0, slightlyLow: 0, low: 0 }
  participants.forEach((person) => {
    counts.all += 1
    const category = getRiskCategory(person.Risk)
    counts[category] += 1
  })
  return counts
})

const levelFilterCounts = computed(() => {
  const counts = { all: 0, A: 0, B: 0, C: 0, D: 0 }
  participants.forEach((person) => {
    counts.all += 1
    if (counts[person.Level] !== undefined) counts[person.Level] += 1
  })
  return counts
})

const filteredParticipants = computed(() => {
  if (sortMode.value === 'risk') {
    if (riskFilter.value === 'all') return participants
    return participants.filter((person) => getRiskCategory(person.Risk) === riskFilter.value)
  }
  if (levelFilter.value === 'all') return participants
  return participants.filter((person) => person.Level === levelFilter.value)
})

const overviewText = computed(() => `共 ${filteredParticipants.value.length} 位參與者`)

const activeFilterCounts = computed(() =>
  sortMode.value === 'risk' ? riskFilterCounts.value : levelFilterCounts.value,
)

const gaitChartRef = ref(null)
const riskChartRef = ref(null)
let gaitChartInstance = null
let riskChartInstance = null

const announcementTitle = ref('')
const announcementContent = ref('')

function isAssessmentSelected(index) {
  return selectedAssessmentIndices.value.includes(index)
}

function toggleAssessmentSelection(index) {
  if (isAssessmentSelected(index)) {
    selectedAssessmentIndices.value = selectedAssessmentIndices.value.filter((item) => item !== index)
  } else {
    selectedAssessmentIndices.value = [...selectedAssessmentIndices.value, index]
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

const isAllMode = computed(() =>
  sortMode.value === 'risk' ? riskFilter.value === 'all' : levelFilter.value === 'all',
)

function getCardBorderColor(person) {
  if (isAllMode.value) return '#000'
  if (sortMode.value === 'risk') {
    return riskStyles[getRiskCategory(person.Risk)]?.border || '#6c757d'
  }
  return levelStyles[person.Level]?.border || '#6c757d'
}

function getBadgeLabel(person) {
  if (sortMode.value === 'risk') {
    return riskLabelMap[getRiskCategory(person.Risk)]
  }
  return levelStyles[person.Level]?.label || person.Level
}

function getMouthPath(person) {
  if (sortMode.value === 'risk') {
    const category = getRiskCategory(person.Risk)
    if (category === 'low') return 'M40 65 Q50 75 60 65'
    if (category === 'slightlyLow') return 'M40 65 L60 65'
    return 'M40 65 Q50 55 60 65'
  }
  if (person.Level === 'D') return 'M40 65 Q50 75 60 65'
  if (person.Level === 'C') return 'M40 65 L60 65'
  return 'M40 65 Q50 55 60 65'
}

function getFaceFill(person) {
  if (sortMode.value === 'risk') {
    return riskStyles[getRiskCategory(person.Risk)]?.face || '#ffd039'
  }
  return levelStyles[person.Level]?.face || '#eee'
}

function setSortMode(mode) {
  sortMode.value = mode
}

function setRiskFilter(value) {
  riskFilter.value = value
}

function setLevelFilter(value) {
  levelFilter.value = value
}

function setFilter(value) {
  if (sortMode.value === 'risk') {
    riskFilter.value = value
  } else {
    levelFilter.value = value
  }
}

function filterButtonLabel(item) {
  return `${item.label} (${activeFilterCounts.value[item.value] ?? 0})`
}

function formatPersonDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

function genderText(gender) {
  return gender === 0 ? '女' : '男'
}

function buildGaitChartConfig() {
  return {
    type: 'line',
    data: {
      labels: ['2024/10', '2024/11', '2024/12', '2025/01', '2025/02', '2025/03'],
      datasets: [
        {
          label: '平均步行速度 (cm/s)',
          data: [82, 85, 88, 90, 87, 93],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } },
    },
  }
}

function buildRiskChartConfig() {
  return {
    type: 'line',
    data: {
      labels: ['2024/10', '2024/11', '2024/12', '2025/01', '2025/02', '2025/03'],
      datasets: [
        {
          label: '平均 AI 跌倒風險機率 (%)',
          data: [28.5, 26.2, 24.8, 22.1, 23.5, 21.0],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  }
}

function initCharts() {
  if (gaitChartRef.value) {
    gaitChartInstance?.destroy()
    gaitChartInstance = new Chart(gaitChartRef.value, buildGaitChartConfig())
  }
  if (riskChartRef.value) {
    riskChartInstance?.destroy()
    riskChartInstance = new Chart(riskChartRef.value, buildRiskChartConfig())
  }
}

function onDownloadGaitChart() {
  downloadChartAsPng(gaitChartRef.value, 'walkingGaitChart')
}

function onDownloadRiskChart() {
  downloadChartAsPng(riskChartRef.value, 'walkingRiskChart')
}

function onSaveAnnouncement() {
  window.alert('Demo 頁面：儲存功能未串接')
}

function onSelectRegion(value) {
  selectedRegion.value = value
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function onLogout() {
  window.alert('Demo 頁面：登出功能未串接')
}

onMounted(() => {
  initCharts()
})

onBeforeUnmount(() => {
  gaitChartInstance?.destroy()
  riskChartInstance?.destroy()
})
</script>

<template>
  <div class="custom-container content bg-white">
    <div class="page-wrapper">
      <aside id="mySidebar" class="sidebar" :class="{ collapsed: isCollapsed }">
        <button id="sidebarToggle" type="button" class="btn btn-primary shadow-sm" @click="toggleSidebar">
          <i class="bi bi-chevron-left" :class="{ 'rotate-180': isCollapsed }" />
        </button>

        <div class="sidebar-inner-content">
          <div class="text-center mt-3 mb-2">
            <img style="max-width:150px; height:auto" :src="logoSrc" alt="logo" />
          </div>

          <header class="custom-header mt-4 mb-4">
            <div>
              <h1 class="custom-title h3 mb-1">{{ systemTitle }}</h1>
              <p class="custom-subtitle">{{ systemSubtitle }}</p>
            </div>
            <div
              class="dashboard-header-toolbar mt-3"
              style="display: flex; flex-direction: column; gap: 8px"
            >
              <div class="header-region dropdown w-100">
                <button
                  class="btn btn-primary dropdown-toggle w-100"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ regionLabel }}
                </button>
                <ul class="dropdown-menu w-100">
                  <li v-for="option in regionOptions" :key="option.value">
                    <a class="dropdown-item" href="#" @click.prevent="onSelectRegion(option.value)">
                      {{ option.label }}
                    </a>
                  </li>
                </ul>
              </div>
              <div class="header-actions w-100">
                <button class="btn btn-primary w-100" type="button" @click="onLogout">
                  登出
                </button>
              </div>
            </div>
          </header>

          <nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top border-bottom hide-on-all">
            <div class="container-fluid">
              <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#walkingNavbar"
              >
                <span class="navbar-toggler-icon" />
              </button>
              <div id="walkingNavbar" class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li v-for="item in navItems" :key="item.href" class="nav-item">
                    <a class="nav-link fw-bold text-dark" :href="item.href">{{ item.label }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <div class="main-content">
        <!-- ① 檢測統計摘要 -->
        <section id="summary" class="mt-4 mb-4 bg-white p-4 rounded shadow compare-hide">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center">
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
            <span>檢測統計摘要</span>
          </h5>

          <div class="row g-4">
            <div class="col-md-6">
              <div class="stat-card stat-blue h-100">
                <h6 class="fw-semibold mb-2">受測人數</h6>
                <div class="d-flex align-items-end">
                  <span class="display-6 fw-bold text-blue">{{ summaryStats.totalPeople }}</span>
                  <span class="ms-2 mb-1 text-blue">人</span>
                </div>
                <p class="small mt-2 invisible">placeholder</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="stat-card stat-green h-100">
                <h6 class="fw-semibold mb-2">檢測次數</h6>
                <div class="d-flex align-items-end">
                  <span class="display-6 fw-bold text-green">{{ summaryStats.totalVisits }}</span>
                  <span class="ms-2 mb-1 text-green">次</span>
                </div>
                <p class="small mt-2 invisible">placeholder</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ② 歷次檢測 -->
        <section id="history" class="mt-4 hide-on-all">
          <h6 class="fw-semibold text-secondary mb-3">歷次檢測</h6>

          <div class="d-flex gap-2 mb-3">
            <button
              id="checkAllBtn"
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="selectAllAssessments"
            >
              全選
            </button>
            <button
              id="uncheckAllBtn"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="unselectAllAssessments"
            >
              取消全選
            </button>
          </div>

          <div id="assessmentCardsContainer" class="row g-3">
            <div
              v-for="(record, index) in assessmentRecords"
              :key="index"
              class="col-12 col-md-6 col-lg-4 mb-3"
            >
              <div
                :class="isAssessmentSelected(index)
                  ? 'card h-100 selectable-card border-primary shadow bg-light'
                  : 'card h-100 selectable-card border-light shadow-sm'"
                role="button"
                tabindex="0"
                style="cursor:pointer; border-width:2px; transition:all 0.2s ease"
                @click="toggleAssessmentSelection(index)"
                @keydown.enter.prevent="toggleAssessmentSelection(index)"
                @keydown.space.prevent="toggleAssessmentSelection(index)"
              >
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                      <div
                        class="status-indicator me-2"
                        :class="isAssessmentSelected(index) ? 'bg-primary' : 'bg-secondary opacity-25'"
                        style="width:12px; height:12px; border-radius:50%"
                      />
                      <span class="fw-bold text-dark">{{ record.date }}</span>
                    </div>
                    <span class="badge bg-white text-primary border border-primary-subtle">
                      {{ record.count }} 人
                    </span>
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-12">
                      <div class="p-2 rounded bg-white border text-center">
                        <small class="text-muted d-block">平均步行速度</small>
                        <span class="fw-bold text-dark d-block">{{ record.gaitSpeed }} cm/s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ③ 群體變化趨勢 -->
        <section id="trend" class="mb-8 hide-on-all compare-hide">
          <h5 class="fw-bold mb-3 d-flex align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              class="me-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style="stroke: #3b82f6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>群體變化趨勢</span>
          </h5>

          <div class="row g-4">
            <div class="col-12 col-md-6">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between">
                    <h5 class="fw-semibold text-dark mb-0">平均步行速度趨勢</h5>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary download-chart"
                      @click="onDownloadGaitChart"
                    >
                      <i class="bi bi-download me-1" />
                      <span>下載圖表</span>
                    </button>
                  </div>
                  <div class="text-muted small mb-2">建議維持 ≥ 100 cm/s</div>
                  <div
                    class="chart-container position-relative"
                    style="position: relative; height: 300px; width: 100%"
                  >
                    <canvas id="walkingGaitChart" ref="gaitChartRef" />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="card shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between">
                    <h5 class="fw-semibold text-dark mb-0">平均 AI 跌倒風險機率</h5>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary download-chart"
                      @click="onDownloadRiskChart"
                    >
                      <i class="bi bi-download me-1" />
                      <span>下載圖表</span>
                    </button>
                  </div>
                  <div class="text-muted small mb-2 opacity-0" aria-hidden="true">&nbsp;</div>
                  <div
                    class="chart-container position-relative"
                    style="position: relative; height: 300px; width: 100%"
                  >
                    <canvas id="walkingRiskChart" ref="riskChartRef" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ④ 參與者狀態 -->
        <section id="status" class="mb-4 hide-on-all compare-hide">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>參與者狀態</span>
          </h5>

          <div class="d-flex gap-2 mb-3 sortModeSwitch">
            <button
              type="button"
              class="btn btn-outline-primary"
              :class="{ active: sortMode === 'risk' }"
              @click="setSortMode('risk')"
            >
              依風險排序
            </button>
            <button
              type="button"
              class="btn btn-outline-primary"
              :class="{ active: sortMode === 'level' }"
              @click="setSortMode('level')"
            >
              依 VIVIFRAIL 等級排序
            </button>
          </div>

          <div v-show="sortMode === 'risk'" class="risk" id="riskContainer">
            <div class="d-none d-md-flex gap-2 mb-3 filterBtnsDesktop">
              <button
                v-for="item in riskFilters"
                :key="item.value"
                type="button"
                class="btn flex-fill"
                :class="[item.btnClass, { active: riskFilter === item.value }, { 'text-white': item.value !== 'all' }]"
                @click="setFilter(item.value)"
              >
                {{ filterButtonLabel(item) }}
              </button>
            </div>

            <div v-if="!filteredParticipants.length" class="col-12">
              <div class="alert alert-secondary text-center">沒有符合條件的參與者</div>
            </div>
            <template v-else>
              <div class="col-12 mb-2">
                <div class="alert alert-info small py-2 px-3 mb-2">{{ overviewText }}</div>
              </div>
              <div id="personContainer" class="row g-3">
                <div
                  v-for="person in filteredParticipants"
                  :key="`risk-${person.Number}`"
                  class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3"
                >
                  <div
                    class="person-card bg-white rounded shadow-sm h-100"
                    role="button"
                    tabindex="0"
                    :style="{ border: `3px solid ${getCardBorderColor(person)}` }"
                  >
                    <div :class="isAllMode ? 'd-flex flex-column' : 'position-relative'">
                      <div
                        v-if="!isAllMode"
                        class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start"
                        :style="{ backgroundColor: getCardBorderColor(person) }"
                      >
                        {{ getBadgeLabel(person) }}
                      </div>

                      <div v-if="!isAllMode" class="face-container mb-2">
                        <svg class="w-100" height="130" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="30" :fill="getFaceFill(person)" />
                          <circle cx="40" cy="45" r="5" fill="#4B5563" />
                          <circle cx="60" cy="45" r="5" fill="#4B5563" />
                          <path
                            :d="getMouthPath(person)"
                            fill="none"
                            stroke="#4B5563"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>

                      <div
                        v-if="isAllMode"
                        class="px-2 py-2 mb-2"
                        style="background: #f8f9fa; border-radius: 6px"
                      >
                        <div
                          v-for="(style, key) in riskStyles"
                          :key="key"
                          class="d-flex justify-content-between align-items-center mb-1"
                        >
                          <div class="d-flex align-items-center">
                            <span
                              style="width:12px; height:12px; display:inline-block; border-radius:50%; margin-right:6px"
                              :style="{ background: style.border }"
                            />
                            <span class="small text-dark">{{ riskLabelMap[key] }}</span>
                          </div>
                          <span class="small fw-semibold text-dark">{{ riskFilterCounts[key] }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="p-2 text-center">
                      <h4 class="fw-semibold text-dark mb-1 masked-name">{{ person.Name }}</h4>
                      <p class="small text-muted mb-0">{{ person.Age }} 歲 | {{ genderText(person.Gender) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-show="sortMode === 'level'" class="level" id="levelContainer">
            <div class="d-none d-md-flex gap-2 mb-3 levelFilterBtnsDesktop">
              <button
                v-for="item in levelFilters"
                :key="item.value"
                type="button"
                class="btn flex-fill"
                :class="[item.btnClass, { active: levelFilter === item.value }, { 'text-white': item.value !== 'all' }]"
                @click="setFilter(item.value)"
              >
                {{ filterButtonLabel(item) }}
              </button>
            </div>

            <div v-if="!filteredParticipants.length" class="col-12">
              <div class="alert alert-secondary text-center">沒有符合條件的參與者</div>
            </div>
            <template v-else>
              <div class="col-12 mb-2">
                <div class="alert alert-info small py-2 px-3 mb-2">{{ overviewText }}</div>
              </div>
              <div id="levelPersonContainer" class="row g-3">
                <div
                  v-for="person in filteredParticipants"
                  :key="`level-${person.Number}`"
                  class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3"
                >
                  <div
                    class="person-card bg-white rounded shadow-sm h-100"
                    role="button"
                    tabindex="0"
                    :style="{ border: `3px solid ${getCardBorderColor(person)}` }"
                  >
                    <div :class="isAllMode ? 'd-flex flex-column' : 'position-relative'">
                      <div
                        v-if="!isAllMode"
                        class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start"
                        :style="{ backgroundColor: getCardBorderColor(person) }"
                      >
                        {{ getBadgeLabel(person) }}
                      </div>

                      <div v-if="!isAllMode" class="face-container mb-2">
                        <svg class="w-100" height="130" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="30" :fill="getFaceFill(person)" />
                          <circle cx="40" cy="45" r="5" fill="#4B5563" />
                          <circle cx="60" cy="45" r="5" fill="#4B5563" />
                          <path
                            :d="getMouthPath(person)"
                            fill="none"
                            stroke="#4B5563"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>

                      <div
                        v-if="isAllMode"
                        class="px-2 py-2 mb-2"
                        style="background: #f8f9fa; border-radius: 6px"
                      >
                        <div
                          v-for="(style, key) in levelStyles"
                          :key="key"
                          class="d-flex justify-content-between align-items-center mb-1"
                        >
                          <div class="d-flex align-items-center">
                            <span
                              style="width:12px; height:12px; display:inline-block; border-radius:50%; margin-right:6px"
                              :style="{ background: style.border }"
                            />
                            <span class="small text-dark">{{ style.label }}</span>
                          </div>
                          <span class="small fw-semibold text-dark">{{ levelFilterCounts[key] }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="p-2 text-center">
                      <h4 class="fw-semibold text-dark mb-1 masked-name">{{ person.Name }}</h4>
                      <p class="small text-muted mb-0">{{ person.Age }} 歲 | {{ genderText(person.Gender) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- ⑤ 一體機公告編輯 -->
        <section id="kiosk" class="mb-4">
          <div
            style="
              background: #fff;
              border-radius: 16px;
              border: 1px solid #e2e8f0;
              overflow: hidden;
            "
          >
            <div
              class="d-flex align-items-center justify-content-between flex-wrap gap-2"
              style="background: #334155; color: #fff; padding: 16px 24px"
            >
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-display" style="font-size: 1.25rem" />
                <span class="fw-bold">一體機公告編輯</span>
              </div>
              <span class="small" style="color: #cbd5e1">編輯後按確認，將顯示於裝置畫面</span>
            </div>

            <div style="padding: 24px">
              <div class="row g-4 mb-4">
                <div class="col-12 col-md-6">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label for="announcementTitle" class="small text-muted mb-0">公告標題</label>
                    <span class="small text-muted">{{ announcementTitle.length }} / 50</span>
                  </div>
                  <input
                    id="announcementTitle"
                    v-model="announcementTitle"
                    type="text"
                    maxlength="50"
                    placeholder="請輸入公告標題"
                    class="form-control"
                    style="
                      background: #f8fafc;
                      border: 1.5px solid #e2e8f0;
                      border-radius: 10px;
                    "
                    @focus="$event.target.style.borderColor = '#3b82f6'"
                    @blur="$event.target.style.borderColor = '#e2e8f0'"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label for="announcementContent" class="small text-muted mb-0">公告內容</label>
                    <span class="small text-muted">{{ announcementContent.length }} / 50</span>
                  </div>
                  <input
                    id="announcementContent"
                    v-model="announcementContent"
                    type="text"
                    maxlength="50"
                    placeholder="請輸入公告內容"
                    class="form-control"
                    style="
                      background: #f8fafc;
                      border: 1.5px solid #e2e8f0;
                      border-radius: 10px;
                    "
                    @focus="$event.target.style.borderColor = '#3b82f6'"
                    @blur="$event.target.style.borderColor = '#e2e8f0'"
                  />
                </div>
              </div>

              <button
                type="button"
                class="btn d-inline-flex align-items-center gap-2"
                style="background: #334155; color: #fff; border: none; border-radius: 10px; padding: 10px 20px"
                @click="onSaveAnnouncement"
              >
                <i class="bi bi-send" />
                <span>儲存並套用</span>
              </button>

              <div style="margin-top: 24px">
                <div
                  style="
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 12px;
                  "
                >
                  <span
                    style="
                      background: #e2e8f0;
                      color: #475569;
                      font-size: 0.75rem;
                      padding: 3px 10px;
                      border-radius: 99px;
                    "
                  >
                    裝置顯示預覽
                  </span>
                </div>

                <div
                  style="
                    background: #0f172a;
                    border-radius: 10px;
                    padding: 20px 24px;
                    min-height: 80px;
                  "
                >
                  <div
                    :style="announcementTitle
                      ? {
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#f1f5f9',
                        marginBottom: '6px',
                      }
                      : {
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#475569',
                        marginBottom: '6px',
                      }"
                  >
                    {{ announcementTitle || '（標題將顯示於此）' }}
                  </div>
                  <div
                    :style="announcementContent
                      ? {
                        fontSize: '0.9rem',
                        color: '#94a3b8',
                        lineHeight: '1.7',
                      }
                      : {
                        fontSize: '0.9rem',
                        color: '#334155',
                        lineHeight: '1.7',
                      }"
                  >
                    {{ announcementContent || '（內容將顯示於此）' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
