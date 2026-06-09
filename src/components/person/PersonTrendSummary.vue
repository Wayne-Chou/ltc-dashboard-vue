<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  trend: { type: Object, default: null },
})

const { t } = useI18n()

const items = computed(() => [
  { key: 'sitStand', value: props.trend?.sitStand, higherIsBetter: false },
  { key: 'balance', value: props.trend?.balance, higherIsBetter: true },
  { key: 'gait', value: props.trend?.gait, higherIsBetter: true },
  { key: 'risk', value: props.trend?.risk, higherIsBetter: false },
])

function arrowMeta(val, higherIsBetter) {
  if (val == null || Number.isNaN(val)) return { text: '-', tone: 'neutral' }
  const isImproved = higherIsBetter ? val > 0 : val < 0
  const isWorse = higherIsBetter ? val < 0 : val > 0
  if (isImproved) return { text: `↑ ${Math.abs(val).toFixed(1)}%`, tone: 'good' }
  if (isWorse) return { text: `↓ ${Math.abs(val).toFixed(1)}%`, tone: 'critical' }
  return { text: '0%', tone: 'watch' }
}
</script>

<template>
  <div id="trendSummary">
    <div v-if="!trend" class="trend-empty">
      <div class="trend-empty-icon">📊</div>
      <div class="trend-empty-text">{{ t('personDetail.trendSummary.noData') }}</div>
    </div>
    <div v-else class="row g-3">
      <div
        v-for="item in items"
        :key="item.key"
        class="col-12 col-md-3"
      >
        <div class="trend-card" :class="`tone-${arrowMeta(item.value, item.higherIsBetter).tone}`">
          <div class="trend-card-title">
            {{ t(`personDetail.trendSummary.items.${item.key}`) }}
          </div>
          <div class="trend-card-value">
            {{ arrowMeta(item.value, item.higherIsBetter).text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
