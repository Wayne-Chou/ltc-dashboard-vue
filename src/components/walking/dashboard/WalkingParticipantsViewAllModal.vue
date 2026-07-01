<script setup>
import WalkingPersonCard from '@/components/walking/dashboard/WalkingPersonCard.vue'
import { useBootstrapModal } from '@/composables/useBootstrapModal'
import {
  getRiskCategory,
  mergePersonsByName,
} from '@/utils/dashboard'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['risk', 'level'].includes(value),
  },
  initialFilter: {
    type: String,
    default: 'all',
  },
  participants: {
    type: Array,
    required: true,
  },
  hasNoData: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select-person'])

const { t } = useI18n()

const modalRef = ref(null)
const activeFilter = ref('all')
const mobileDropdownLabel = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

useBootstrapModal(modalRef, visible, (value) => {
  visible.value = value
})

const riskFilters = [
  {
    value: 'all',
    desktopLabelKey: 'dashboard.all',
    mobileLabelKey: 'dashboard.all',
    btnClass: 'btn-secondary',
  },
  {
    value: 'high',
    desktopLabelKey: 'dashboard.riskLabel.high',
    mobileLabelKey: 'dashboard.riskHighDanger',
    btnClass: 'btn-danger risk-high-danger',
  },
  {
    value: 'slightlyHigh',
    desktopLabelKey: 'dashboard.riskLabel.slightlyHigh',
    mobileLabelKey: 'dashboard.riskHigh',
    btnClass: 'btn-warning risk-high',
  },
  {
    value: 'medium',
    desktopLabelKey: 'dashboard.riskLabel.medium',
    mobileLabelKey: 'dashboard.riskMedium',
    btnClass: 'btn-primary risk-medium',
  },
  {
    value: 'slightlyLow',
    desktopLabelKey: 'dashboard.riskLabel.slightlyLow',
    mobileLabelKey: 'dashboard.riskSlightlyLow',
    btnClass: 'btn-info risk-slightly-low',
  },
  {
    value: 'low',
    desktopLabelKey: 'dashboard.riskLabel.low',
    mobileLabelKey: 'dashboard.riskLow',
    btnClass: 'btn-success risk-low',
  },
]

const levelFilters = [
  { value: 'all', labelKey: 'dashboard.all', btnClass: 'btn-secondary' },
  { value: 'A', labelKey: 'dashboard.levelAFull', btnClass: 'btn-danger' },
  { value: 'B', labelKey: 'dashboard.levelBFull', btnClass: 'btn-warning' },
  { value: 'C', labelKey: 'dashboard.levelCFull', btnClass: 'btn-primary' },
  { value: 'D', labelKey: 'dashboard.levelDFull', btnClass: 'btn-success' },
]

const filters = computed(() => (props.mode === 'risk' ? riskFilters : levelFilters))

const rawPersons = computed(() => props.participants)

const filteredRawPersons = computed(() => {
  if (activeFilter.value === 'all') return rawPersons.value

  if (props.mode === 'risk') {
    return rawPersons.value.filter(
      (person) => getRiskCategory(person.Risk) === activeFilter.value,
    )
  }

  return rawPersons.value.filter((person) => person.Level === activeFilter.value)
})

const filterCounts = computed(() => {
  if (props.mode === 'risk') {
    const counts = { all: 0, high: 0, slightlyHigh: 0, medium: 0, slightlyLow: 0, low: 0 }
    rawPersons.value.forEach((person) => {
      counts.all += 1
      counts[getRiskCategory(person.Risk)] += 1
    })
    return counts
  }

  const counts = { all: 0, A: 0, B: 0, C: 0, D: 0 }
  rawPersons.value.forEach((person) => {
    counts.all += 1
    if (counts[person.Level] !== undefined) counts[person.Level] += 1
  })
  return counts
})

const mergedPersons = computed(() =>
  mergePersonsByName(filteredRawPersons.value, props.mode),
)

const sortedPersons = computed(() => {
  if (props.mode !== 'level') return mergedPersons.value

  const levelOrder = { A: 1, B: 2, C: 3, D: 4 }
  return [...mergedPersons.value].sort(
    (a, b) => (levelOrder[a.Level] || 0) - (levelOrder[b.Level] || 0),
  )
})

const isAllMode = computed(() => activeFilter.value === 'all')

const overviewText = computed(() => {
  if (!sortedPersons.value.length && !props.hasNoData) return ''

  if (props.mode === 'risk') {
    if (isAllMode.value) {
      return t('dashboard.levelOverviewText', {
        people: mergedPersons.value.length,
        records: filteredRawPersons.value.length,
      })
    }

    return t('dashboard.levelSingleText', {
      levelName: t(`dashboard.riskLabel.${activeFilter.value}`),
      people: mergedPersons.value.length,
      records: filteredRawPersons.value.length,
    })
  }

  if (isAllMode.value) {
    return t('dashboard.overviewAllText', {
      people: mergedPersons.value.length,
      records: filteredRawPersons.value.length,
    })
  }

  const filterItem = levelFilters.find((item) => item.value === activeFilter.value)
  return t('dashboard.overviewLevelText', {
    level: filterItem ? t(filterItem.labelKey) : activeFilter.value,
    people: mergedPersons.value.length,
    records: filteredRawPersons.value.length,
  })
})

const modalRootId = computed(() =>
  props.mode === 'risk' ? 'walkingParticipantsModal' : 'walkingParticipantsLevelModal',
)

const desktopFilterId = computed(() =>
  props.mode === 'risk' ? 'walkingModalFilterBtnsDesktop' : 'walkingModalLevelFilterBtnsDesktop',
)

const mobileDropdownId = computed(() =>
  props.mode === 'risk' ? 'walkingModalFilterDropdownMobile' : 'walkingModalLevelFilterDropdownMobile',
)

const personContainerId = computed(() =>
  props.mode === 'risk' ? 'walkingModalPersonContainer' : 'walkingModalLevelPersonContainer',
)

const mobileDropdownButtonId = computed(() =>
  props.mode === 'risk' ? 'walkingModalFilterDropdownMobileBtn' : undefined,
)

const mobilePlaceholder = computed(() =>
  props.mode === 'risk' ? t('dashboard.selectRisk') : t('dashboard.selectLevel'),
)

function filterDesktopLabel(item) {
  const labelKey = props.mode === 'risk' ? item.desktopLabelKey : item.labelKey
  return `${t(labelKey)} (${filterCounts.value[item.value] || 0})`
}

function filterMobileLabel(item) {
  const labelKey = props.mode === 'risk' ? item.mobileLabelKey : item.labelKey
  return `${t(labelKey)} (${filterCounts.value[item.value] || 0})`
}

function filterBaseLabel(item) {
  const labelKey = props.mode === 'risk' ? item.mobileLabelKey : item.labelKey
  return t(labelKey)
}

function syncMobileDropdownLabel() {
  const filter = filters.value.find((item) => item.value === activeFilter.value)
  mobileDropdownLabel.value = filter ? filterBaseLabel(filter) : ''
}

function setFilter(value) {
  activeFilter.value = value
  syncMobileDropdownLabel()
}

function onSelectPerson(person) {
  emit('select-person', person)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      activeFilter.value = props.initialFilter || 'all'
      syncMobileDropdownLabel()
    }
  },
)

watch(
  () => props.mode,
  () => {
    activeFilter.value = 'all'
    mobileDropdownLabel.value = ''
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      :id="modalRootId"
      ref="modalRef"
      class="modal fade"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header flex-column">
            <h5 class="modal-title w-100">
              {{ t('dashboard.allParticipants') }}
            </h5>

            <div
              v-if="mode === 'risk'"
              :id="desktopFilterId"
              class="d-none d-md-flex gap-2 mt-2 w-100"
            >
              <button
                v-for="item in filters"
                :key="`desktop-${item.value}`"
                type="button"
                class="btn flex-fill text-white"
                :class="[item.btnClass, { active: activeFilter === item.value }]"
                :data-risk="item.value"
                @click="setFilter(item.value)"
              >
                {{ filterDesktopLabel(item) }}
              </button>
            </div>

            <div
              v-else
              :id="desktopFilterId"
              class="d-none d-md-flex gap-2 mt-2 w-100"
            >
              <button
                v-for="item in filters"
                :key="`desktop-${item.value}`"
                type="button"
                class="btn flex-fill text-white"
                :class="[item.btnClass, { active: activeFilter === item.value }]"
                :data-filter="item.value"
                @click="setFilter(item.value)"
              >
                {{ filterDesktopLabel(item) }}
              </button>
            </div>

            <div
              v-if="mode === 'risk'"
              :id="mobileDropdownId"
              class="dropdown d-md-none mt-2 w-100"
            >
              <button
                :id="mobileDropdownButtonId"
                class="btn btn-outline-secondary dropdown-toggle w-100"
                type="button"
                data-bs-toggle="dropdown"
              >
                {{ mobileDropdownLabel || mobilePlaceholder }}
              </button>
              <ul class="dropdown-menu w-100">
                <li v-for="item in filters" :key="`mobile-${item.value}`">
                  <a
                    class="dropdown-item"
                    href="#"
                    :data-risk="item.value"
                    @click.prevent="setFilter(item.value)"
                  >
                    {{ filterMobileLabel(item) }}
                  </a>
                </li>
              </ul>
            </div>

            <div
              v-else
              :id="mobileDropdownId"
              class="dropdown d-md-none mt-2 w-100"
            >
              <button
                class="btn btn-outline-secondary dropdown-toggle w-100"
                type="button"
                data-bs-toggle="dropdown"
              >
                {{ mobileDropdownLabel || mobilePlaceholder }}
              </button>
              <ul class="dropdown-menu w-100">
                <li v-for="item in filters" :key="`mobile-${item.value}`">
                  <a
                    class="dropdown-item"
                    href="#"
                    :data-filter="item.value"
                    @click.prevent="setFilter(item.value)"
                  >
                    {{ filterMobileLabel(item) }}
                  </a>
                </li>
              </ul>
            </div>

            <button
              type="button"
              class="btn-close mt-2"
              data-bs-dismiss="modal"
              :aria-label="t('dashboard.close')"
              @click="visible = false"
            />
          </div>

          <div class="modal-body">
            <div :id="personContainerId" class="row g-3">
              <div v-if="hasNoData || !sortedPersons.length" class="col-12">
                <div class="alert alert-secondary text-center">
                  {{
                    hasNoData
                      ? t('dashboard.noRecord')
                      : t('dashboard.noMatchedPerson')
                  }}
                </div>
              </div>
              <template v-else>
                <div class="col-12 mb-2">
                  <div class="alert alert-info small py-2 px-3 mb-2">
                    {{ overviewText }}
                  </div>
                </div>
                <WalkingPersonCard
                  v-for="person in sortedPersons"
                  :key="`${mode}-${person.Number}-${person.Name}-${person.Date}`"
                  :mode="mode"
                  :person="person"
                  :is-all-mode="isAllMode"
                  :active-filter="isAllMode ? null : activeFilter"
                  @select-person="onSelectPerson"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
