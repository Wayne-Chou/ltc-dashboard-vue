<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  person: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'risk',
    validator: (value) => ['risk', 'level'].includes(value),
  },
  isAllMode: {
    type: Boolean,
    default: false,
  },
  activeFilter: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-person'])

const { t } = useI18n()

const genderText = computed(() =>
  props.person.Gender === 0 ? t('dashboard.female') : t('dashboard.male'),
)



const riskStyles = {
  high: { face: '#ff5757', border: '#dc3545' },
  slightlyHigh: { face: '#ffa203', border: '#fd7e14' },
  medium: { face: '#ffd039', border: '#ffc107' },
  slightlyLow: { face: '#8cff00', border: '#28a745' },
  low: { face: '#4ffa00', border: '#198754' },
}

const levelStyles = {
  A: { face: '#FEE2E2', border: '#dc3545' },
  B: { face: '#FEF3C7', border: '#fd7e14' },
  C: { face: '#DBEAFE', border: '#0d6efd' },
  D: { face: '#DCFCE7', border: '#28a745' },
}

const riskCategory = computed(() => {
  if (props.person.Risk > 50) return 'high'
  if (props.person.Risk > 30) return 'slightlyHigh'
  if (props.person.Risk > 17.5) return 'medium'
  if (props.person.Risk > 5) return 'slightlyLow'
  return 'low'
})

const cardBorderColor = computed(() => {
  if (props.mode === 'risk') {
    return props.isAllMode
      ? '#000'
      : riskStyles[riskCategory.value]?.border || '#6c757d'
  }
  return props.isAllMode
    ? '#000'
    : levelStyles[props.person.Level]?.border || '#6c757d'
})

const badgeLabel = computed(() => {
  if (props.mode === 'risk') {
    return t(`dashboard.riskLabel.${riskCategory.value}`)
  }
  return (
    t(`dashboard.vivifrailLevelLabel.${props.person.Level}`) ||
    props.person.Level ||
    ''
  )
})

const mouthPath = computed(() => {
  if (props.mode === 'risk') {
    if (riskCategory.value === 'low') return 'M40 65 Q50 75 60 65'
    if (riskCategory.value === 'slightlyLow') return 'M40 65 L60 65'
    return 'M40 65 Q50 55 60 65'
  }

  if (props.person.Level === 'D') return 'M40 65 Q50 75 60 65'
  if (props.person.Level === 'C') return 'M40 65 L60 65'
  return 'M40 65 Q50 55 60 65'
})

const faceFill = computed(() => {
  if (props.mode === 'risk') {
    return riskStyles[riskCategory.value]?.face || '#ffd039'
  }
  return levelStyles[props.person.Level]?.face || '#eee'
})

const topSummaryRows = computed(() => {
  if (props.mode === 'risk' && props.isAllMode) {
    return Object.keys(riskStyles).map((key) => ({
      key,
      color: riskStyles[key].border,
      label: t(`dashboard.riskLabel.${key}`),
      count: props.person.riskCounts?.[key] || 0,
    }))
  }

  if (props.mode === 'level' && props.isAllMode) {
    return ['A', 'B', 'C', 'D'].map((level) => ({
      key: level,
      color: levelStyles[level].border,
      label: t(`dashboard.vivifrailLevelLabel.${level}`) || level,
      count: props.person.levelCounts?.[level] || 0,
    }))
  }

  return []
})

const footerSummaryRows = computed(() => {
  if (props.mode === 'level' && !props.isAllMode && props.activeFilter) {
    return [
      {
        key: props.person.Level,
        color: levelStyles[props.person.Level]?.border,
        label: badgeLabel.value,
        count: props.person.mergedCount || 1,
      },
    ]
  }

  return []
})

const wrapperClass = computed(() => {
  if (props.mode === 'risk' && props.isAllMode) return 'd-flex flex-column'
  return 'position-relative'
})

function onCardClick() {
  emit('select-person', props.person)
}
</script>

<template>
  <div class="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
    <div
      class="person-card bg-white rounded shadow-sm h-100"
      role="button"
      tabindex="0"
      :style="{ border: `3px solid ${cardBorderColor}` }"
      @click="onCardClick"
      @keydown.enter.prevent="onCardClick"
      @keydown.space.prevent="onCardClick"
    >
      <div :class="wrapperClass">
        <div
          v-if="!isAllMode"
          class="position-absolute top-0 end-0 text-white small px-2 py-1 rounded-start"
          :style="{ backgroundColor: cardBorderColor }"
        >
          {{ badgeLabel }}
        </div>

        <div v-if="!isAllMode && mode === 'level'" class="face-container mb-2">
          <svg class="w-100" height="130" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" :fill="faceFill" />
            <circle cx="40" cy="45" r="5" fill="#4B5563" />
            <circle cx="60" cy="45" r="5" fill="#4B5563" />
            <path
              :d="mouthPath"
              fill="none"
              stroke="#4B5563"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <svg
          v-else-if="!isAllMode && mode === 'risk'"
          class="w-100"
          height="130"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="30" :fill="faceFill" />
          <circle cx="40" cy="45" r="5" fill="#4B5563" />
          <circle cx="60" cy="45" r="5" fill="#4B5563" />
          <path
            :d="mouthPath"
            fill="none"
            stroke="#4B5563"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>

        <div
          v-if="topSummaryRows.length"
          class="px-2 py-2 mb-2"
          style="background: #f8f9fa; border-radius: 6px"
        >
          <div
            v-for="row in topSummaryRows"
            :key="row.key"
            class="d-flex justify-content-between align-items-center mb-1"
          >
            <div class="d-flex align-items-center">
              <span
                style="
                  width: 12px;
                  height: 12px;
                  display: inline-block;
                  border-radius: 50%;
                  margin-right: 6px;
                "
                :style="{ background: row.color }"
              />
              <span class="small text-dark">{{ row.label }}</span>
            </div>
            <span class="small fw-semibold text-dark">{{ row.count }}</span>
          </div>
        </div>
      </div>

      <div class="p-2 text-center">
        <h4 class="fw-semibold text-dark mb-1 masked-name">
          {{ person.Name }}
        </h4>
        <p class="small text-muted mb-0">
          {{ person.Age }}{{ t('dashboard.yearsOld') }} | {{ genderText }}
        </p>
      

        <div
          v-if="footerSummaryRows.length"
          class="px-2 py-2 mb-2"
          style="background: #f8f9fa; border-radius: 6px"
        >
          <div
            v-for="row in footerSummaryRows"
            :key="row.key"
            class="d-flex justify-content-between align-items-center"
          >
            <div class="d-flex align-items-center">
              <span
                style="
                  width: 12px;
                  height: 12px;
                  display: inline-block;
                  border-radius: 50%;
                  margin-right: 6px;
                "
                :style="{ background: row.color }"
              />
              <span class="small text-dark">{{ row.label }}</span>
            </div>
            <span class="small fw-semibold text-dark">{{ row.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
