<script setup>
defineProps({
  showRegionSections: {
    type: Boolean,
    default: false,
  },
  summaryColClass: {
    type: String,
    required: true,
  },
  summaryStats: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section
    id="summary"
    class="mt-4 mb-4 bg-white p-4 rounded shadow"
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>檢測統計摘要</span>
    </h5>

    <div v-if="showRegionSections" class="my-3">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="請選擇日期範圍"
          readonly
        />
        <button class="btn btn-outline-secondary" type="button">
          清除
        </button>
      </div>
    </div>

    <div class="row g-4">
      <div :class="summaryColClass">
        <div class="stat-card stat-blue h-100">
          <h6 class="fw-semibold mb-2">受測人數</h6>
          <div class="d-flex align-items-end">
            <span class="display-6 fw-bold text-blue">{{
              summaryStats.totalPeople
            }}</span>
            <span class="ms-2 mb-1 text-blue">人</span>
          </div>
          <p class="small mt-2 text-blue">
            {{ summaryStats.startDateText }}
          </p>
        </div>
      </div>
      <div :class="summaryColClass">
        <div class="stat-card stat-green h-100">
          <h6 class="fw-semibold mb-2">檢測次數</h6>
          <div class="d-flex align-items-end">
            <span class="display-6 fw-bold text-green">{{
              summaryStats.totalVisits
            }}</span>
            <span class="ms-2 mb-1 text-green">次</span>
          </div>
          <p class="small mt-2 text-green">
            {{ summaryStats.latestDateText }}
          </p>
        </div>
      </div>
      <div v-if="!showRegionSections" class="col-md-4">
        <div class="stat-card stat-purple h-100">
          <h6 class="fw-semibold mb-2">據點數</h6>
          <div class="d-flex align-items-end">
            <span class="display-6 fw-bold text-purple">{{
              summaryStats.locationCount
            }}</span>
            <span class="ms-2 mb-1 text-purple">處</span>
          </div>
          <p class="small mt-2 text-purple">
            {{ summaryStats.locationList }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
