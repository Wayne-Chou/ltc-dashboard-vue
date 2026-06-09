<script setup>
import { useChart } from '@/composables/useChart'
import { buildTrendChartConfig } from '@/utils/chartConfigs'
import { downloadChartAsPng } from '@/utils/downloadChart'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: (value) => ['sitStand', 'balance', 'gait', 'risk'].includes(value),
  },
  canvasId: {
    type: String,
    required: true,
  },
  titleKey: {
    type: String,
    required: true,
  },
  hintKey: {
    type: String,
    default: '',
  },
  hintHidden: {
    type: Boolean,
    default: false,
  },
  assessments: {
    type: Array,
    default: () => [],
  },
  hasNoData: {
    type: Boolean,
    default: false,
  },
})

const { t, locale } = useI18n()
const canvasRef = ref(null)
const { updateChart, destroyChart, clearCanvas } = useChart(canvasRef)

const showOverlay = computed(() => props.hasNoData)

async function renderChart() {
  await nextTick()
  if (!canvasRef.value) return

  if (props.hasNoData || !props.assessments.length) {
    destroyChart()
    clearCanvas()
    return
  }

  const config = buildTrendChartConfig(props.chartType, props.assessments, t)
  updateChart(config)
}

watch(
  () => [props.assessments, props.hasNoData, locale.value],
  () => {
    void renderChart()
  },
  { deep: true },
)

onMounted(() => {
  void renderChart()
})

function onDownloadChart() {
  downloadChartAsPng(canvasRef.value, props.canvasId)
}
</script>

<template>
  <div class="col-12 col-md-6">
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="fw-semibold text-dark mb-0">{{ t(titleKey) }}</h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary download-chart"
            @click="onDownloadChart"
          >
            <i class="bi bi-download me-1" />
            <span>{{ t('dashboard.downloadChart') }}</span>
          </button>
        </div>

        <div
          class="text-muted small mb-2"
          :class="{ 'opacity-0': hintHidden }"
          :aria-hidden="hintHidden"
        >
          {{ hintKey ? t(hintKey) : '\u00a0' }}
        </div>

        <div
          class="chart-container position-relative"
          style="position: relative; height: 300px; width: 100%"
        >
          <canvas :id="canvasId" ref="canvasRef" />

          <div v-if="showOverlay" class="no-data-overlay">
            <div class="text-center">
              <i class="bi bi-database-exclamation d-block mb-2 h4" />
              <span>{{ t('dashboard.alertNoData') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
