<script setup>
import { useChart } from '@/composables/useChart'
import { buildPersonChartConfig } from '@/utils/personChartConfigs'
import { drawPersonChartNoData } from '@/utils/personChartCanvas'
import { downloadChartAsPng } from '@/utils/downloadChart'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: (v) => ['sitStand', 'balance', 'gait', 'risk'].includes(v),
  },
  canvasId: { type: String, required: true },
  titleKey: { type: String, required: true },
  hintKey: { type: String, default: '' },
  assessments: { type: Array, default: () => [] },
  hasNoData: { type: Boolean, default: false },
  /** legacy: last chart-card has no mb-4 */
  marginBottom: { type: Boolean, default: true },
})

const { t, locale } = useI18n()
const canvasRef = ref(null)
const { updateChart, destroyChart, clearCanvas } = useChart(canvasRef)

async function renderChart() {
  await nextTick()
  if (!canvasRef.value) return

  if (props.hasNoData || !props.assessments.length) {
    destroyChart()
    clearCanvas()
    drawPersonChartNoData(canvasRef.value, t('personDetail.alertNoData'))
    return
  }

  const config = buildPersonChartConfig(props.chartType, props.assessments, t)
  updateChart(config)
}

watch(() => [props.assessments, props.hasNoData, locale.value], () => void renderChart(), {
  deep: true,
})
onMounted(() => void renderChart())

function onDownload() {
  downloadChartAsPng(canvasRef.value, props.canvasId)
}
</script>

<template>
  <div
    class="chart-card"
    :class="{ 'mb-4': marginBottom }"
  >
    <div class="chart-head">
      <div>
        <div class="chart-title">{{ t(titleKey) }}</div>
        <div v-if="hintKey" class="chart-sub">{{ t(hintKey) }}</div>
      </div>
      <button
        type="button"
        class="download-chart"
        :data-target="canvasId"
        @click="onDownload"
      >
        <i class="fa-solid fa-download" />
        <span>{{ t('personDetail.downloadImage') }}</span>
      </button>
    </div>
    <div class="chart-body">
      <canvas :id="canvasId" ref="canvasRef" />
    </div>
  </div>
</template>
