<script setup>
import CompareChartCard from '@/components/dashboard/compare/CompareChartCard.vue'
import { COMPARE_CHART_SPECS } from '@/utils/compareChartConfig'
</script>

<template>
  <div class="row g-4 compare-chart-grid">
    <CompareChartCard
      v-for="spec in COMPARE_CHART_SPECS"
      :key="spec.canvasId"
      :spec="spec"
    />
  </div>
</template>
