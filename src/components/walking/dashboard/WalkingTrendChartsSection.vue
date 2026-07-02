<script setup>
import { downloadChartAsPng } from '@/utils/downloadChart'
import Chart from 'chart.js/auto'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const gaitChartRef = ref(null)
const riskChartRef = ref(null)
let gaitChartInstance = null
let riskChartInstance = null

function buildGaitChartConfig() {
  return {
    type: 'line',
    data: {
      labels: [
        '2024/10',
        '2024/11',
        '2024/12',
        '2025/01',
        '2025/02',
        '2025/03',
      ],
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
      labels: [
        '2024/10',
        '2024/11',
        '2024/12',
        '2025/01',
        '2025/02',
        '2025/03',
      ],
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

onMounted(() => {
  initCharts()
})

onBeforeUnmount(() => {
  gaitChartInstance?.destroy()
  gaitChartInstance = null
  riskChartInstance?.destroy()
  riskChartInstance = null
})
</script>

<template>
  <section id="trend" class="mb-8">
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
            <div
              class="d-flex align-items-center justify-content-between"
            >
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
            <div
              class="d-flex align-items-center justify-content-between"
            >
              <h5 class="fw-semibold text-dark mb-0">
                平均 AI 跌倒風險機率
              </h5>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary download-chart"
                @click="onDownloadRiskChart"
              >
                <i class="bi bi-download me-1" />
                <span>下載圖表</span>
              </button>
            </div>
            <div
              class="text-muted small mb-2 opacity-0"
              aria-hidden="true"
            >
              &nbsp;
            </div>
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
</template>
