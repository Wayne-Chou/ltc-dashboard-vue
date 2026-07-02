<script setup>
import TrendChartCard from '@/components/dashboard/TrendChartCard.vue'
import { useDashboardDataInject } from '@/composables/useDashboardData'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { selectedAssessments, hasNoData } = useDashboardDataInject()

const charts = [
  {
    chartType: 'sitStand',
    canvasId: 'sitStandChartCanvas',
    titleKey: 'dashboard.avgSitStandTrend',
    hintKey: 'dashboard.recommendLessThan12',
  },
  {
    chartType: 'balance',
    canvasId: 'balanceChartCanvas',
    titleKey: 'dashboard.avgBalanceTrend',
    hintKey: 'dashboard.recommendGreaterThan35',
  },
  {
    chartType: 'gait',
    canvasId: 'gaitChartCanvas',
    titleKey: 'dashboard.avgGaitSpeedTrend',
    hintKey: 'dashboard.recommendGte100',
  },
  {
    chartType: 'risk',
    canvasId: 'riskChartCanvas',
    titleKey: 'dashboard.avgAiFallRisk',
    hintKey: '',
    hintHidden: true,
  },
]
</script>

<template>
  <div class="mb-8">
    <h5 id="trend" class="fw-bold mb-3 d-flex align-items-center">
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
      <span>{{ t('dashboard.trend') }}</span>
    </h5>

    <div id="groupCompareToggle" class="my-4">
      <div class="row g-4">
        <TrendChartCard
          v-for="chart in charts"
          :key="chart.canvasId"
          :chart-type="chart.chartType"
          :canvas-id="chart.canvasId"
          :title-key="chart.titleKey"
          :hint-key="chart.hintKey"
          :hint-hidden="chart.hintHidden ?? false"
          :assessments="selectedAssessments"
          :has-no-data="hasNoData"
        />
      </div>
    </div>
  </div>
</template>
