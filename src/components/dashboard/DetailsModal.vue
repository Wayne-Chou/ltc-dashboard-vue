<script setup>
import { useBootstrapModal } from '@/composables/useBootstrapModal'
import { useDashboardDataInject } from '@/composables/useDashboardData'
import {
  MONTH_NAMES_EN,
  buildAllLevelsGroups,
  buildMonthDateGroups,
  collectDegenerateLists,
  getAssessmentYears,
  getMonthsWithData,
} from '@/utils/detailModalData'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()
const { selectedAssessments } = useDashboardDataInject()

const modalRef = ref(null)
const selectedYear = ref(null)
const activeMonth = ref('all')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

useBootstrapModal(modalRef, visible, (value) => {
  visible.value = value
})

const hasData = computed(() => selectedAssessments.value.length > 0)

const degenerate = computed(() => collectDegenerateLists(selectedAssessments.value, t))

const years = computed(() => getAssessmentYears(selectedAssessments.value))

const monthsWithData = computed(() => {
  if (!selectedYear.value) return new Set()
  return getMonthsWithData(selectedAssessments.value, selectedYear.value)
})

const allLevelGroups = computed(() => {
  if (!selectedYear.value || activeMonth.value !== 'all') return []
  return buildAllLevelsGroups(selectedAssessments.value, selectedYear.value, t)
})

const monthDateGroups = computed(() => {
  if (!selectedYear.value || activeMonth.value === 'all') return []
  return buildMonthDateGroups(
    selectedAssessments.value,
    selectedYear.value,
    activeMonth.value,
    t,
  )
})

const monthButtons = computed(() => {
  const buttons = []
  for (let month = 1; month <= 12; month += 1) {
    const hasMonthData = monthsWithData.value.has(month)
    buttons.push({
      month,
      hasData: hasMonthData,
      label:
        locale.value === 'en' ? MONTH_NAMES_EN[month - 1] : `${month}${t('dashboard.month')}`,
    })
  }
  return buttons
})

function resetYearAndMonth() {
  if (!years.value.length) {
    selectedYear.value = null
    activeMonth.value = 'all'
    return
  }
  selectedYear.value = years.value[0]
  activeMonth.value = 'all'
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetYearAndMonth()
    }
  },
)

watch(years, () => {
  if (props.modelValue) {
    resetYearAndMonth()
  }
})

function selectYear(event) {
  selectedYear.value = Number(event.target.value)
  activeMonth.value = 'all'
}

function selectMonth(month) {
  if (!monthsWithData.value.has(month)) return
  activeMonth.value = month
}
</script>

<template>
  <Teleport to="body">
  <div
    ref="modalRef"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="detailsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="detailsModalLabel" class="modal-title">{{ t('dashboard.detailList') }}</h5>
          <button
            type="button"
            class="btn-close"
            :aria-label="t('dashboard.close')"
            @click="visible = false"
          />
        </div>

        <div class="modal-body">
          <div v-if="!hasData" class="p-5 text-center text-muted">
            {{ t('dashboard.alertNoData') }}
          </div>

          <template v-else>
            <section class="mb-4">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-exclamation-triangle-fill text-warning me-2" />
                {{ t('dashboard.degenerateWarning') }}
              </h6>
              <div class="row g-2">
                <div class="col-12 col-md-6">
                  <div class="card">
                    <div class="card-header py-2 small fw-bold">
                      {{ t('dashboard.walkDecline') }} ({{ degenerate.totalGait }})
                    </div>
                    <ul
                      class="list-group list-group-flush"
                      style="max-height: 200px; overflow-y: auto"
                    >
                      <li
                        v-for="(name, index) in degenerate.gaitNames"
                        :key="`gait-${index}`"
                        class="list-group-item small"
                      >
                        {{ name }}
                      </li>
                      <li
                        v-if="!degenerate.gaitNames.length"
                        class="list-group-item text-muted small"
                      >
                        {{ t('dashboard.alertNoData') }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="card">
                    <div class="card-header py-2 small fw-bold">
                      {{ t('dashboard.sitStandIncrease') }} ({{ degenerate.totalChair }})
                    </div>
                    <ul
                      class="list-group list-group-flush"
                      style="max-height: 200px; overflow-y: auto"
                    >
                      <li
                        v-for="(name, index) in degenerate.chairNames"
                        :key="`chair-${index}`"
                        class="list-group-item small"
                      >
                        {{ name }}
                      </li>
                      <li
                        v-if="!degenerate.chairNames.length"
                        class="list-group-item text-muted small"
                      >
                        {{ t('dashboard.alertNoData') }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <hr />

            <section>
              <div class="mb-3 fw-bold">
                <i class="bi bi-people-fill me-2" />
                {{ t('dashboard.highRiskGroup') }}
              </div>

              <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <select
                  class="form-select form-select-sm w-auto"
                  :value="selectedYear"
                  @change="selectYear"
                >
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
                <div class="d-flex flex-wrap gap-1">
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="activeMonth === 'all' ? 'btn-secondary active' : 'btn-outline-secondary'"
                    @click="activeMonth = 'all'"
                  >
                    {{ t('dashboard.all') }}
                  </button>
                  <button
                    v-for="btn in monthButtons"
                    :key="btn.month"
                    type="button"
                    class="btn btn-sm"
                    :class="
                      btn.hasData
                        ? activeMonth === btn.month
                          ? 'btn-primary active'
                          : 'btn-outline-primary'
                        : 'btn-outline-secondary disabled'
                    "
                    :disabled="!btn.hasData"
                    @click="selectMonth(btn.month)"
                  >
                    {{ btn.label }}
                  </button>
                </div>
              </div>

              <div v-if="activeMonth === 'all'" class="row g-2">
                <div
                  v-for="group in allLevelGroups"
                  :key="group.level"
                  class="col-12 col-md-6 col-lg-3 mb-2"
                >
                  <div class="card">
                    <div
                      class="card-header py-2 small fw-bold text-white"
                      :class="`bg-${group.headerClass}`"
                    >
                      {{ group.title }} ({{ group.names.length }})
                    </div>
                    <ul class="list-group list-group-flush small">
                      <li
                        v-for="(name, index) in group.names"
                        :key="`${group.level}-${index}`"
                        class="list-group-item"
                      >
                        {{ name }}
                      </li>
                      <li v-if="!group.names.length" class="list-group-item text-muted">
                        {{ t('dashboard.alertNoData') }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div v-else>
                <div
                  v-for="(dateGroup, dateIndex) in monthDateGroups"
                  :key="`date-${dateIndex}`"
                  class="mb-4 p-2 bg-light rounded"
                >
                  <h6 class="fw-bold small mb-2">{{ dateGroup.dateLabel }}</h6>
                  <div class="row g-2">
                    <div
                      v-for="level in dateGroup.levels"
                      :key="`${dateGroup.dateLabel}-${level.level}`"
                      class="col-12 col-md-6 col-lg-3"
                    >
                      <div class="card">
                        <div
                          class="card-header py-1 x-small text-white"
                          :class="`bg-${level.headerClass}`"
                        >
                          {{ level.title }} ({{ level.names.length }})
                        </div>
                        <ul class="list-group list-group-flush x-small">
                          <li
                            v-for="(name, nameIndex) in level.names"
                            :key="`${level.level}-${nameIndex}`"
                            class="list-group-item"
                          >
                            {{ name }}
                          </li>
                          <li v-if="!level.names.length" class="list-group-item text-muted">
                            {{ t('dashboard.alertNoData') }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" @click="visible = false">
            {{ t('dashboard.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>
