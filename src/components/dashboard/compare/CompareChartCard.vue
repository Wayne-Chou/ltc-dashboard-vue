<script setup>
import { useChart } from '@/composables/useChart'
import { useCompareModeInject } from '@/composables/useCompareMode'
import { buildCompareMultiLineChartConfig } from '@/utils/compareChartConfig'
import { downloadChartAsPng } from '@/utils/downloadChart'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  spec: {
    type: Object,
    required: true,
  },
})

const compare = useCompareModeInject()
const { t } = useI18n()
const canvasRef = ref(null)
const { updateChart, destroyChart, clearCanvas } = useChart(canvasRef)

const groupedData = computed(() => compare.groupedData)
const showOverlay = computed(() => compare.compareChartsNoData)

const overlayMessage = computed(() => {
  if (compare.compareNoDataMessage) {
    return compare.compareNoDataMessage
  }
  return t('dashboard.alertNoData')
})

async function renderChart() {
  await nextTick()
  if (!canvasRef.value) return

  if (showOverlay.value) {
    destroyChart()
    clearCanvas()
    return
  }

  const data = groupedData.value
  if (!data?.length) {
    destroyChart()
    clearCanvas()
    return
  }

  const config = buildCompareMultiLineChartConfig(data, props.spec.dataKey, {
    unit: props.spec.unit,
  })
  updateChart(config)
}

watch(
  () => [groupedData.value, showOverlay.value, compare.controlsGeneration],
  () => {
    void renderChart()
  },
)

onMounted(() => {
  void renderChart()
})

function onDownloadChart() {
  downloadChartAsPng(canvasRef.value, props.spec.canvasId)
}
</script>

<template>
  <div class="col-12 col-md-6">
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="fw-semibold text-dark mb-0">{{ spec.title }}</h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary download-chart"
            :data-target="spec.canvasId"
            @click="onDownloadChart"
          >
            <i class="fa fa-download me-1" />
            下載圖檔
          </button>
        </div>

        <div
          class="text-muted small mb-2"
          :class="{ 'opacity-0': spec.hintHidden }"
          :aria-hidden="spec.hintHidden"
        >
          {{ spec.hint || '\u00a0' }}
        </div>

        <div
          class="chart-container position-relative"
          style="position: relative; height: 300px; width: 100%"
        >
          <canvas :id="spec.canvasId" ref="canvasRef" />

          <div v-if="showOverlay" class="no-data-overlay">
            <div class="text-center">
              <i class="bi bi-database-exclamation d-block mb-2 h4" />
              <span>{{ overlayMessage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
