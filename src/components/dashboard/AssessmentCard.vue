<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  assessment: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-selection'])

const { t } = useI18n()

const dateText = computed(() => {
  const date = new Date(props.assessment.Date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
})

const participantText = computed(() =>
  t('dashboard.participantCount', { count: props.assessment.Count }),
)

const isHighRisk = computed(() => props.assessment.RiskRate > 20)

const cardClass = computed(() =>
  props.selected
    ? 'card h-100 selectable-card border-primary shadow bg-light'
    : 'card h-100 selectable-card border-light shadow-sm',
)

function onCardClick() {
  emit('toggle-selection', props.index)
}
</script>

<template>
  <div class="col-12 col-md-6 col-lg-4 mb-3">
    <div
      :class="cardClass"
      role="button"
      tabindex="0"
      style="cursor: pointer; border-width: 2px; transition: all 0.2s ease"
      @click="onCardClick"
      @keydown.enter.prevent="onCardClick"
      @keydown.space.prevent="onCardClick"
    >
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center">
            <div
              class="status-indicator me-2"
              :class="selected ? 'bg-primary' : 'bg-secondary opacity-25'"
              style="width: 12px; height: 12px; border-radius: 50%"
            />
            <span class="fw-bold text-dark">{{ dateText }}</span>
          </div>
          <span class="badge bg-white text-primary border border-primary-subtle">
            {{ participantText }}
          </span>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-12">
            <div class="p-2 rounded bg-white border text-center">
              <small class="text-muted d-block">{{ t('dashboard.avgSitStand') }}</small>
              <span class="fw-bold text-dark d-block">
                {{ assessment.ChairSecond.toFixed(1) }}{{ t('dashboard.seconds') }}
              </span>
            </div>
          </div>
          <div class="col-12">
            <div class="p-2 rounded bg-white border text-center">
              <small class="text-muted d-block">{{ t('dashboard.avgBalanceScore') }}</small>
              <span class="fw-bold text-dark d-block">
                {{ assessment.BalanceScore.toFixed(1) }}{{ t('dashboard.points') }}
              </span>
            </div>
          </div>
          <div class="col-12">
            <div class="p-2 rounded bg-white border text-center">
              <small class="text-muted d-block">{{ t('dashboard.avgGaitSpeed') }}</small>
              <span class="fw-bold text-dark d-block">
                {{ assessment.GaitSpeed.toFixed(0) }} cm/s
              </span>
            </div>
          </div>
        </div>

        <div class="mt-2">
          <div class="d-flex justify-content-between mb-1 small">
            <span class="text-muted fw-bold">{{ t('dashboard.avgFallRisk') }}</span>
            <span class="fw-bold" :class="isHighRisk ? 'text-danger' : 'text-success'">
              {{ assessment.RiskRate.toFixed(1) }}%
            </span>
          </div>
          <div class="progress" style="height: 8px; background-color: #e9ecef">
            <div
              class="progress-bar"
              :class="isHighRisk ? 'bg-danger' : 'bg-primary'"
              :style="{ width: `${assessment.RiskRate}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
