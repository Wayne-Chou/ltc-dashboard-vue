<script setup>
import { downloadChartAsPng } from '@/utils/downloadChart'
import Chart from 'chart.js/auto'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const personDataMap = {
  1: {
    Name: '王○明',
    Age: 72,
    Gender: 1,
    headline: {
      badge: '持續改善',
      title: '步行能力穩定進步',
      desc: '最近三次檢測顯示步行速度持續提升，跌倒風險逐步下降',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 8.5, risk: -12.3 },
    records: [
      { date: '2025/01/12', risk: '低風險', riskColor: '#198754', gait: 82 },
      { date: '2025/02/08', risk: '偏低', riskColor: '#28a745', gait: 85 },
      { date: '2025/03/15', risk: '中風險', riskColor: '#ffc107', gait: 90 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 93 },
    ],
    gaitData: [82, 85, 90, 93],
    riskData: [35, 28, 32, 18],
  },
  2: {
    Name: '李○華',
    Age: 68,
    Gender: 0,
    headline: {
      badge: '狀況穩定',
      title: '步行能力維持良好',
      desc: '近期檢測顯示步行速度與跌倒風險皆維持穩定區間',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 1.2, risk: -2.0 },
    records: [
      { date: '2025/01/12', risk: '偏低', riskColor: '#28a745', gait: 95 },
      { date: '2025/02/08', risk: '偏低', riskColor: '#28a745', gait: 96 },
      { date: '2025/03/15', risk: '低風險', riskColor: '#198754', gait: 97 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 96 },
    ],
    gaitData: [95, 96, 97, 96],
    riskData: [20, 19, 17, 18],
  },
  3: {
    Name: '張○強',
    Age: 75,
    Gender: 1,
    headline: {
      badge: '需要留意',
      title: '跌倒風險略有上升',
      desc: '近期步行速度下降，建議增加追蹤頻率並安排進一步評估',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'watch',
    },
    trend: { gait: -6.5, risk: 9.8 },
    records: [
      { date: '2025/01/12', risk: '中風險', riskColor: '#ffc107', gait: 75 },
      { date: '2025/02/08', risk: '中風險', riskColor: '#ffc107', gait: 72 },
      { date: '2025/03/15', risk: '高風險', riskColor: '#fd7e14', gait: 68 },
      { date: '2025/04/02', risk: '高危險', riskColor: '#dc3545', gait: 65 },
    ],
    gaitData: [75, 72, 68, 65],
    riskData: [38, 42, 48, 55],
  },
  4: {
    Name: '陳○美',
    Age: 70,
    Gender: 0,
    headline: {
      badge: '表現優異',
      title: '步行能力表現良好',
      desc: '各項指標皆維持低風險區間，建議持續保持目前運動習慣',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 3.1, risk: -5.5 },
    records: [
      { date: '2025/01/12', risk: '低風險', riskColor: '#198754', gait: 100 },
      { date: '2025/02/08', risk: '低風險', riskColor: '#198754', gait: 102 },
      { date: '2025/03/15', risk: '低風險', riskColor: '#198754', gait: 103 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 104 },
    ],
    gaitData: [100, 102, 103, 104],
    riskData: [10, 9, 8, 7],
  },
}

const personId = computed(() => Number(route.params.id))
const personData = computed(() => personDataMap[personId.value] ?? personDataMap[1])

const genderLabel = computed(() => (personData.value.Gender === 1 ? '男' : '女'))

const selectedIndices = ref([])

const gaitChartRef = ref(null)
const riskChartRef = ref(null)
let gaitChartInstance = null
let riskChartInstance = null

const chartLabels = ['2025/01', '2025/02', '2025/03', '2025/04']

function goBack() {
  router.back()
}

function resetSelectedIndices() {
  selectedIndices.value = personData.value.records.map((_, index) => index)
}

function trendTone(value, invert = false) {
  const isPositive = invert ? value < 0 : value > 0
  const isNegative = invert ? value > 0 : value < 0
  if (isPositive) return 'tone-good'
  if (isNegative) return 'tone-watch'
  return 'tone-neutral'
}

function formatTrendValue(value) {
  const abs = Math.abs(value).toFixed(1)
  if (value > 0) return `↑ ${abs}%`
  if (value < 0) return `↓ ${abs}%`
  return `${abs}%`
}

function isChecked(index) {
  return selectedIndices.value.includes(index)
}

function toggleRecord(index) {
  if (isChecked(index)) {
    selectedIndices.value = selectedIndices.value.filter((item) => item !== index)
  } else {
    selectedIndices.value = [...selectedIndices.value, index]
  }
}

function selectAllRecords() {
  selectedIndices.value = personData.value.records.map((_, index) => index)
}

function unselectAllRecords() {
  selectedIndices.value = []
}

function buildGaitChartConfig() {
  return {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: '步行速度 (cm/s)',
          data: personData.value.gaitData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false },
      },
    },
  }
}

function buildRiskChartConfig() {
  return {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'AI 跌倒風險 (%)',
          data: personData.value.riskData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
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

function destroyCharts() {
  gaitChartInstance?.destroy()
  gaitChartInstance = null
  riskChartInstance?.destroy()
  riskChartInstance = null
}

function onDownloadGaitChart() {
  downloadChartAsPng(gaitChartRef.value, 'walkingPersonGaitChart')
}

function onDownloadRiskChart() {
  downloadChartAsPng(riskChartRef.value, 'walkingPersonRiskChart')
}

watch(personId, () => {
  resetSelectedIndices()
  void nextTick(() => {
    initCharts()
  })
})

onMounted(() => {
  document.body.classList.add('app')
  resetSelectedIndices()
  void nextTick(() => {
    initCharts()
  })
})

onBeforeUnmount(() => {
  destroyCharts()
  document.body.classList.remove('app')
})
</script>

<template>
  <div class="container app-shell">
    <header class="patient-header">
      <div class="patient-header-top">
        <div class="back-action">
          <button
            id="personDetailBackBtn"
            type="button"
            class="custom-back-btn"
            @click="goBack"
          >
            <div class="icon-circle">
              <i class="fa-solid fa-arrow-left" />
            </div>
            <span>返回</span>
          </button>
        </div>
        <div class="patient-title">
          <div class="patient-name">
            <i class="fa-solid fa-user-injured" />
            <h1 id="personName">{{ personData.Name }}</h1>
          </div>
        </div>
      </div>

      <div id="personInfo" class="patient-meta">
        <div class="meta-item">
          <div class="meta-label">性別</div>
          <div class="meta-value">{{ genderLabel }}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">年齡</div>
          <div class="meta-value">{{ personData.Age }}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">編號</div>
          <div class="meta-value">{{ personId }}</div>
        </div>
      </div>

      <section
        id="reportHeadline"
        class="headline clinical-headline"
        :data-status="personData.headline.status"
      >
        <div class="headline-left">
          <div class="headline-badge" :data-tone="personData.headline.status">
            <i
              :class="
                personData.headline.status === 'watch'
                  ? 'fa-solid fa-triangle-exclamation'
                  : 'fa-solid fa-arrow-trend-up'
              "
            />
            <span>{{ personData.headline.badge }}</span>
          </div>
          <div class="headline-text">
            <div class="headline-title">{{ personData.headline.title }}</div>
            <div class="headline-desc">{{ personData.headline.desc }}</div>
          </div>
        </div>
        <div class="headline-right">
          <div class="headline-meta">
            <div class="meta-label">比較區間</div>
            <div id="reportRange" class="meta-value">{{ personData.headline.rangeText }}</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">
              <i class="fa-solid fa-wand-magic-sparkles" />
              <span>評估變化重點摘要</span>
            </h2>
            <div class="panel-hint">已選擇 4 筆評估紀錄，比較分析以最近兩筆為準</div>
          </div>
        </div>
        <div class="panel-body">
          <div id="trendSummary">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="trend-card" :class="trendTone(personData.trend.gait)">
                  <div class="trend-card-title">步行速度</div>
                  <div class="trend-card-value">{{ formatTrendValue(personData.trend.gait) }}</div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="trend-card" :class="trendTone(personData.trend.risk, true)">
                  <div class="trend-card-title">AI 跌倒風險</div>
                  <div class="trend-card-value">{{ formatTrendValue(personData.trend.risk) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>

    <main class="report">
      <div class="layout">
        <div class="layout-left">
          <section class="panel">
            <h2 class="panel-title mb-0">
              <i class="fa-solid fa-table" />
              <span>評估紀錄明細</span>
            </h2>
            <div class="panel-header align-items-start">
              <div>
                <div class="panel-hint mt-0">可勾選評估紀錄以檢視步行相關趨勢</div>
              </div>
              <div class="panel-actions">
                <button id="checkAllBtn" type="button" class="btn-soft" @click="selectAllRecords">
                  全選
                </button>
                <button
                  id="uncheckAllBtn"
                  type="button"
                  class="btn-soft secondary"
                  @click="unselectAllRecords"
                >
                  取消全選
                </button>
              </div>
            </div>

            <div class="panel-body">
              <div id="personTable" class="table-wrap">
                <div class="record-list">
                  <label
                    v-for="(record, index) in personData.records"
                    :key="record.date"
                    class="record-item"
                  >
                    <input
                      type="checkbox"
                      class="row-check"
                      :data-index="index"
                      :checked="isChecked(index)"
                      @change="toggleRecord(index)"
                    />
                    <div class="record-content w-100">
                      <div class="record-date">{{ record.date }}</div>
                      <div class="record-metrics">
                        <span class="risk">
                          跌倒風險
                          <b :style="{ color: record.riskColor }">{{ record.risk }}</b>
                        </span>
                        <span>
                          步行速度
                          <b>{{ record.gait }} cm/s</b>
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="layout-right">
          <section class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">
                  <i class="fa-solid fa-chart-line" />
                  <span>趨勢分析圖表</span>
                </h2>
              </div>
            </div>

            <div class="panel-body">
              <div class="chart-card mb-4">
                <div class="chart-head">
                  <div>
                    <div class="chart-title">步行速度趨勢</div>
                    <div class="chart-sub">建議大於等於 100 cm/s</div>
                  </div>
                  <button
                    type="button"
                    class="download-chart"
                    data-target="walkingPersonGaitChartCanvas"
                    @click="onDownloadGaitChart"
                  >
                    <i class="fa-solid fa-download" />
                    <span>下載圖檔</span>
                  </button>
                </div>
                <div class="chart-body">
                  <canvas id="walkingPersonGaitChartCanvas" ref="gaitChartRef" />
                </div>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div>
                    <div class="chart-title">AI 跌倒風險機率</div>
                  </div>
                  <button
                    type="button"
                    class="download-chart"
                    data-target="walkingPersonRiskChartCanvas"
                    @click="onDownloadRiskChart"
                  >
                    <i class="fa-solid fa-download" />
                    <span>下載圖檔</span>
                  </button>
                </div>
                <div class="chart-body">
                  <canvas id="walkingPersonRiskChartCanvas" ref="riskChartRef" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
