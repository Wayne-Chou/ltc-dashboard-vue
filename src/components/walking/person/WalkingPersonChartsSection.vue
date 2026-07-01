<script setup>
import { downloadChartAsPng } from '@/utils/downloadChart'
import Chart from 'chart.js/auto'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  gaitData: {
    type: Array,
    required: true,
  },
  riskData: {
    type: Array,
    required: true,
  },
  chartLabels: {
    type: Array,
    required: true,
  },
})

const gaitChartRef = ref(null)
const riskChartRef = ref(null)
let gaitChartInstance = null
let riskChartInstance = null

function buildGaitChartConfig() {
  return {
    type: 'line',
    data: {
      labels: props.chartLabels,
      datasets: [
        {
          label: '步行速度 (cm/s)',
          data: props.gaitData,
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
      labels: props.chartLabels,
      datasets: [
        {
          label: 'AI 跌倒風險 (%)',
          data: props.riskData,
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

onMounted(() => {
  void nextTick(() => {
    initCharts()
  })
})

watch(
  () => [props.gaitData, props.riskData, props.chartLabels],
  () => {
    void nextTick(() => {
      initCharts()
    })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  destroyCharts()
})
</script>

<template>
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
</template>
