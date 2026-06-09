<script setup>
import AssessmentCard from '@/components/dashboard/AssessmentCard.vue'
import { useDashboardDataInject } from '@/composables/useDashboardData'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const PAGE_SIZE = 9

const { t, locale } = useI18n()
const {
  assessments,
  selectedIndices,
  toggleSelection,
  selectAllAssessments,
  unselectAllAssessments,
} = useDashboardDataInject()

const currentPage = ref(1)

const sortedAssessments = computed(() =>
  [...assessments.value].sort((a, b) => b.Date - a.Date),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(assessments.value.length / PAGE_SIZE)),
)

const pageData = computed(() => {
  const page = Math.min(Math.max(currentPage.value, 1), totalPages.value)
  const start = (page - 1) * PAGE_SIZE
  return sortedAssessments.value.slice(start, start + PAGE_SIZE).map((item) => ({
    assessment: item,
    index: assessments.value.indexOf(item),
  }))
})

const paginationLabel = computed(() => {
  const pageUnit = locale.value === 'zh' ? t('dashboard.pageUnit') : ''
  return `${t('dashboard.page')} ${currentPage.value} ${t('dashboard.total')} ${totalPages.value}${pageUnit}`
})

const showPagination = computed(() => assessments.value.length > PAGE_SIZE)

watch(
  () => assessments.value.length,
  () => {
    currentPage.value = 1
  },
)

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

function isSelected(index) {
  return selectedIndices.value.includes(index)
}

function goToPrevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}
</script>

<template>
  <div class="mt-4 hide-on-all">
    <h6 class="fw-semibold text-secondary mb-3">
      {{ t('dashboard.historyAverageTable') }}
    </h6>

    <div class="d-flex gap-2 mb-3">
      <button
        id="checkAllBtn"
        type="button"
        class="btn btn-outline-primary btn-sm"
        @click="selectAllAssessments"
      >
        {{ t('dashboard.selectAll') }}
      </button>
      <button
        id="uncheckAllBtn"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="unselectAllAssessments"
      >
        {{ t('dashboard.unselectAll') }}
      </button>
    </div>

    <div v-if="!assessments.length" class="col-12 text-center py-5 text-muted">
      {{ t('dashboard.noRecord') }}
    </div>

    <div v-else id="assessmentCardsContainer" class="row g-3">
      <AssessmentCard
        v-for="entry in pageData"
        :key="`${entry.assessment.Date}-${entry.index}`"
        :assessment="entry.assessment"
        :index="entry.index"
        :selected="isSelected(entry.index)"
        @toggle-selection="toggleSelection"
      />
    </div>

    <div
      v-if="showPagination"
      id="tablePaginationContainer"
      class="d-flex justify-content-between align-items-center mt-4 w-100"
    >
      <button
        type="button"
        class="btn btn-sm btn-outline-primary px-3"
        :disabled="currentPage === 1"
        @click="goToPrevPage"
      >
        {{ t('dashboard.prevPage') }}
      </button>
      <span class="small text-muted fw-bold">{{ paginationLabel }}</span>
      <button
        type="button"
        class="btn btn-sm btn-outline-primary px-3"
        :disabled="currentPage === totalPages"
        @click="goToNextPage"
      >
        {{ t('dashboard.nextPage') }}
      </button>
    </div>
  </div>
</template>
