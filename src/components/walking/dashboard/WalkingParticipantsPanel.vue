<script setup>
import WalkingPersonCard from '@/components/walking/dashboard/WalkingPersonCard.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  riskFilters: {
    type: Array,
    required: true,
  },
  riskFilter: {
    type: String,
    required: true,
  },
  riskFilterCounts: {
    type: Object,
    required: true,
  },
  filteredParticipants: {
    type: Array,
    required: true,
  },
  overviewText: {
    type: String,
    required: true,
  },
  isAllMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['set-risk-filter', 'select-person', 'open-view-all'])

const { t } = useI18n()

function filterButtonLabel(item) {
  return `${item.label} (${props.riskFilterCounts[item.value] ?? 0})`
}

const activeFilter = computed(() =>
  props.riskFilter === 'all' ? null : props.riskFilter,
)
</script>

<template>
  <section
    id="status"
    class="mb-4 mt-3 hide-on-all compare-hide"
  >
    <h5 class="fw-bold text-dark mb-3 d-flex align-items-center">
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
      <span>參與者狀態</span>
    </h5>

    <div class="risk" id="riskContainer">
      <div class="d-none d-md-flex gap-2 mb-3 filterBtnsDesktop">
        <button
          v-for="item in riskFilters"
          :key="item.value"
          type="button"
          class="btn flex-fill"
          :class="[
            item.btnClass,
            { active: riskFilter === item.value },
            { 'text-white': item.value !== 'all' },
          ]"
          @click="emit('set-risk-filter', item.value)"
        >
          {{ filterButtonLabel(item) }}
        </button>
      </div>

      <div v-if="!filteredParticipants.length" class="col-12">
        <div class="alert alert-secondary text-center">
          沒有符合條件的參與者
        </div>
      </div>
      <template v-else>
        <div class="col-12 mb-2">
          <div class="alert alert-info small py-2 px-3 mb-2">
            {{ overviewText }}
          </div>
        </div>
        <div id="personContainer" class="row g-3">
          <WalkingPersonCard
            v-for="person in filteredParticipants"
            :key="`risk-${person.Number}`"
            mode="risk"
            :person="person"
            :is-all-mode="isAllMode"
            :active-filter="activeFilter"
            @select-person="emit('select-person', $event)"
          />
        </div>

        <div class="mt-3 text-end">
          <button
            type="button"
            class="btn btn-primary btn-sm d-inline-flex align-items-center viewAllBtn"
            @click="emit('open-view-all', riskFilter)"
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
  </section>
</template>
