<script setup>
import CompareChartsSection from '@/components/dashboard/compare/CompareChartsSection.vue'
import CompareSummary from '@/components/dashboard/compare/CompareSummary.vue'
import { useCompareModeInject } from '@/composables/useCompareMode'

const compare = useCompareModeInject()
</script>

<template>
  <div id="compare-view" class="compare-view">
    <div class="bg-white p-4 rounded shadow-sm mb-4">
      <h5 class="fw-bold mb-1">
        <i class="bi bi-intersect me-2" />
        群體比較
      </h5>
      <div class="text-muted small">分析據點在各項指標的表現差異</div>
    </div>

    <CompareSummary />

    <div
      v-if="compare.chartHint"
      id="chartHint"
      class="alert alert-info small py-2 px-3 mb-3"
    >
      {{ compare.chartHint }}
    </div>

    <CompareChartsSection />
  </div>
</template>
