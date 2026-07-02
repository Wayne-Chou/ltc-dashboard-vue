<script setup>
import PersonCard from '@/components/dashboard/PersonCard.vue'
import { useDashboardDataInject } from '@/composables/useDashboardData'
import { useDashboardModalsInject } from '@/composables/useDashboardModals'
import {
  flattenLevelData,
  flattenRiskData,
  getRiskCategory,
  mergeAllVIVIFRAIL,
  mergePersonsByName,
} from '@/utils/dashboard'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['select-person', 'filter-change', 'mode-change'])

const { t } = useI18n()
const { selectedAssessments, hasNoData } = useDashboardDataInject()
const { openParticipantsViewAll } = useDashboardModalsInject()

const sortMode = ref('risk')
const riskFilter = ref('all')
const levelFilter = ref('all')

const riskPersons = computed(() => {
  const merged = mergeAllVIVIFRAIL(selectedAssessments.value)
  return flattenRiskData(merged)
})

const levelPersons = computed(() => flattenLevelData(selectedAssessments.value))

const riskFilters = [
  { value: 'all', labelKey: 'dashboard.all', btnClass: 'btn-secondary' },
  { value: 'high', labelKey: 'dashboard.riskHigh', btnClass: 'btn-danger risk-high-danger' },
  { value: 'slightlyHigh', labelKey: 'dashboard.riskSlightlyHigh', btnClass: 'btn-warning risk-high' },
  { value: 'medium', labelKey: 'dashboard.riskMedium', btnClass: 'btn-primary risk-medium' },
  { value: 'slightlyLow', labelKey: 'dashboard.riskSlightlyLow', btnClass: 'btn-info risk-slightly-low' },
  { value: 'low', labelKey: 'dashboard.riskLow', btnClass: 'btn-success risk-low' },
]

const levelFilters = [
  { value: 'all', labelKey: 'dashboard.all', btnClass: 'btn-secondary' },
  { value: 'A', labelKey: 'dashboard.levelAFull', btnClass: 'btn-danger' },
  { value: 'B', labelKey: 'dashboard.levelBFull', btnClass: 'btn-warning' },
  { value: 'C', labelKey: 'dashboard.levelCFull', btnClass: 'btn-primary' },
  { value: 'D', labelKey: 'dashboard.levelDFull', btnClass: 'btn-success' },
]

const riskFilterCounts = computed(() => {
  const counts = { all: 0, high: 0, slightlyHigh: 0, medium: 0, slightlyLow: 0, low: 0 }
  riskPersons.value.forEach((person) => {
    counts.all += 1
    const category = getRiskCategory(person.Risk)
    counts[category] += 1
  })
  return counts
})

const levelFilterCounts = computed(() => {
  const counts = { all: 0, A: 0, B: 0, C: 0, D: 0 }
  levelPersons.value.forEach((person) => {
    counts.all += 1
    if (counts[person.Level] !== undefined) counts[person.Level] += 1
  })
  return counts
})

const filteredRiskPersons = computed(() => {
  if (riskFilter.value === 'all') return riskPersons.value
  return riskPersons.value.filter((person) => getRiskCategory(person.Risk) === riskFilter.value)
})

const filteredLevelPersons = computed(() => {
  if (levelFilter.value === 'all') return levelPersons.value
  return levelPersons.value.filter((person) => person.Level === levelFilter.value)
})

const displayPersons = computed(() => {
  const source = sortMode.value === 'risk' ? filteredRiskPersons.value : filteredLevelPersons.value
  const merged = mergePersonsByName(source, sortMode.value)
  return merged.slice(0, 12)
})

const overviewText = computed(() => {
  const source = sortMode.value === 'risk' ? filteredRiskPersons.value : filteredLevelPersons.value
  const merged = mergePersonsByName(source, sortMode.value)
  const isAll =
    (sortMode.value === 'risk' && riskFilter.value === 'all') ||
    (sortMode.value === 'level' && levelFilter.value === 'all')

  if (isAll) {
    return t('dashboard.levelOverviewText', {
      people: merged.length,
      records: source.length,
    })
  }

  if (sortMode.value === 'risk') {
    const filterItem = riskFilters.find((item) => item.value === riskFilter.value)
    return t('dashboard.levelSingleText', {
      levelName: filterItem ? t(filterItem.labelKey) : riskFilter.value,
      people: merged.length,
      records: source.length,
    })
  }

  const filterItem = levelFilters.find((item) => item.value === levelFilter.value)
  return t('dashboard.overviewLevelText', {
    level: filterItem ? t(filterItem.labelKey) : levelFilter.value,
    people: merged.length,
    records: source.length,
  })
})

const activeFilters = computed(() => (sortMode.value === 'risk' ? riskFilters : levelFilters))

const activeFilterCounts = computed(() =>
  sortMode.value === 'risk' ? riskFilterCounts.value : levelFilterCounts.value,
)

const activeFilter = computed({
  get: () => (sortMode.value === 'risk' ? riskFilter.value : levelFilter.value),
  set: (value) => {
    if (sortMode.value === 'risk') {
      riskFilter.value = value
    } else {
      levelFilter.value = value
    }
    emit('filter-change', { mode: sortMode.value, filter: value })
  },
})

const mobileDropdownLabel = computed(() => {
  const filter = activeFilters.value.find((item) => item.value === activeFilter.value)
  return filter ? `${t(filter.labelKey)} (${activeFilterCounts.value[filter.value] || 0})` : ''
})

watch(sortMode, (mode) => {
  emit('mode-change', mode)
})

function setSortMode(mode) {
  sortMode.value = mode
}

function setFilter(value) {
  activeFilter.value = value
}

function filterButtonLabel(item) {
  return `${t(item.labelKey)} (${activeFilterCounts.value[item.value] || 0})`
}

function onSelectPerson(person) {
  emit('select-person', person)
}

function openRiskViewAll() {
  openParticipantsViewAll('risk', riskFilter.value)
}

function openLevelViewAll() {
  openParticipantsViewAll('level', levelFilter.value)
}
</script>

<template>
  <div class="mb-4">
    <h5 id="status" class="fw-bold text-dark mb-3 d-flex align-items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="me-2 text-primary"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span>{{ t('dashboard.status') }}</span>
    </h5>

    <div class="d-flex gap-2 mb-3 sortModeSwitch">
      <button
        type="button"
        class="btn btn-outline-primary"
        :class="{ active: sortMode === 'risk' }"
        @click="setSortMode('risk')"
      >
        {{ t('dashboard.sortByRisk') }}
      </button>
      <button
        type="button"
        class="btn btn-outline-primary"
        :class="{ active: sortMode === 'level' }"
        @click="setSortMode('level')"
      >
        {{ t('dashboard.sortByVivifrail') }}
      </button>
    </div>

    <div v-if="hasNoData" class="alert alert-secondary text-center mb-3">
      {{ t('dashboard.noRecord') }}
    </div>

    <template v-else>
    <div v-show="sortMode === 'risk'" class="risk" id="riskContainer">
      <div class="d-none d-md-flex gap-2 mb-3 filterBtnsDesktop">
        <button
          v-for="item in riskFilters"
          :key="item.value"
          type="button"
          class="btn flex-fill text-white"
          :class="[item.btnClass, { active: riskFilter === item.value }]"
          @click="setFilter(item.value)"
        >
          {{ filterButtonLabel(item) }}
        </button>
      </div>

      <div class="dropdown d-md-none mb-3 filterDropdownMobile">
        <button
          class="btn btn-outline-secondary dropdown-toggle w-100"
          type="button"
          data-bs-toggle="dropdown"
        >
          {{ mobileDropdownLabel || t('dashboard.selectRisk') }}
        </button>
        <ul class="dropdown-menu w-100">
          <li v-for="item in riskFilters" :key="`mobile-${item.value}`">
            <button type="button" class="dropdown-item" @click="setFilter(item.value)">
              {{ filterButtonLabel(item) }}
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!displayPersons.length" class="col-12">
        <div class="alert alert-secondary text-center">{{ t('dashboard.noMatchedPerson') }}</div>
      </div>
      <template v-else>
        <div class="col-12 mb-2">
          <div class="alert alert-info small py-2 px-3 mb-2">{{ overviewText }}</div>
        </div>
        <div id="personContainer" class="row g-3">
          <PersonCard
            v-for="person in displayPersons"
            :key="`risk-${person.Number}-${person.Name}`"
            mode="risk"
            :person="person"
            :is-all-mode="riskFilter === 'all'"
            :active-filter="riskFilter === 'all' ? null : riskFilter"
            @select-person="onSelectPerson"
          />
        </div>

        <div class="mt-3 text-end">
          <button
            type="button"
            class="btn btn-primary btn-sm d-inline-flex align-items-center viewAllBtn"
            @click="openRiskViewAll"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="me-1"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{{ t('dashboard.viewAllParticipants') }}</span>
          </button>
        </div>
      </template>
    </div>

    <div v-show="sortMode === 'level'" class="level" id="levelContainer">
      <div class="d-none d-md-flex gap-2 mb-3 levelFilterBtnsDesktop">
        <button
          v-for="item in levelFilters"
          :key="item.value"
          type="button"
          class="btn flex-fill text-white"
          :class="[item.btnClass, { active: levelFilter === item.value }]"
          @click="setFilter(item.value)"
        >
          {{ filterButtonLabel(item) }}
        </button>
      </div>

      <div class="dropdown d-md-none mb-3 levelFilterDropdownMobile">
        <button
          class="btn btn-outline-secondary dropdown-toggle w-100"
          type="button"
          data-bs-toggle="dropdown"
        >
          {{ mobileDropdownLabel || t('dashboard.selectLevel') }}
        </button>
        <ul class="dropdown-menu w-100">
          <li v-for="item in levelFilters" :key="`level-mobile-${item.value}`">
            <button type="button" class="dropdown-item" @click="setFilter(item.value)">
              {{ filterButtonLabel(item) }}
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!displayPersons.length" class="col-12">
        <div class="alert alert-secondary text-center">{{ t('dashboard.noMatchedPerson') }}</div>
      </div>
      <template v-else>
        <div class="col-12 mb-2">
          <div class="alert alert-info small py-2 px-3 mb-2">{{ overviewText }}</div>
        </div>
        <div id="levelPersonContainer" class="row g-3">
          <PersonCard
            v-for="person in displayPersons"
            :key="`level-${person.Number}-${person.Name}`"
            mode="level"
            :person="person"
            :is-all-mode="levelFilter === 'all'"
            :active-filter="levelFilter === 'all' ? null : levelFilter"
            @select-person="onSelectPerson"
          />
        </div>

        <div class="mt-3 text-end">
          <button
            type="button"
            class="btn btn-primary btn-sm d-inline-flex align-items-center viewAllBtn"
            @click="openLevelViewAll"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="me-1"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{{ t('dashboard.viewAllParticipants') }}</span>
          </button>
        </div>
      </template>
    </div>
    </template>

  </div>
</template>

