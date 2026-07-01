<script setup>
import WalkingAssessmentCard from '@/components/walking/dashboard/WalkingAssessmentCard.vue'

defineProps({
  assessmentRecords: {
    type: Array,
    required: true,
  },
  selectedAssessmentIndices: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'toggle-selection',
  'select-all',
  'unselect-all',
])

function isAssessmentSelected(index, selectedIndices) {
  return selectedIndices.includes(index)
}
</script>

<template>
  <section id="history" class="mt-4 hide-on-all">
    <h6 class="fw-semibold text-secondary mb-3">歷次檢測</h6>

    <div class="d-flex gap-2 mb-3">
      <button
        id="checkAllBtn"
        type="button"
        class="btn btn-outline-primary btn-sm"
        @click="emit('select-all')"
      >
        全選
      </button>
      <button
        id="uncheckAllBtn"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="emit('unselect-all')"
      >
        取消全選
      </button>
    </div>

    <div id="assessmentCardsContainer" class="row g-3">
      <WalkingAssessmentCard
        v-for="(record, index) in assessmentRecords"
        :key="index"
        :record="record"
        :index="index"
        :selected="isAssessmentSelected(index, selectedAssessmentIndices)"
        @toggle-selection="emit('toggle-selection', $event)"
      />
    </div>
  </section>
</template>
