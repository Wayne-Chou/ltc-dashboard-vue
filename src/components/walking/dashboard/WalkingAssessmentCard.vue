<script setup>
defineProps({
  record: {
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
</script>

<template>
  <div class="col-12 col-md-6 col-lg-4 mb-3">
    <div
      :class="
        selected
          ? 'card h-100 selectable-card border-primary shadow bg-light'
          : 'card h-100 selectable-card border-light shadow-sm'
      "
      role="button"
      tabindex="0"
      style="
        cursor: pointer;
        border-width: 2px;
        transition: all 0.2s ease;
      "
      @click="emit('toggle-selection', index)"
      @keydown.enter.prevent="emit('toggle-selection', index)"
      @keydown.space.prevent="emit('toggle-selection', index)"
    >
      <div class="card-body">
        <div
          class="d-flex justify-content-between align-items-center mb-3"
        >
          <div class="d-flex align-items-center">
            <div
              class="status-indicator me-2"
              :class="
                selected
                  ? 'bg-primary'
                  : 'bg-secondary opacity-25'
              "
              style="width: 12px; height: 12px; border-radius: 50%"
            />
            <span class="fw-bold text-dark">{{ record.date }}</span>
          </div>
          <span
            class="badge bg-white text-primary border border-primary-subtle"
          >
            {{ record.count }} 人
          </span>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-12">
            <div class="p-2 rounded bg-white border text-center">
              <small class="text-muted d-block">平均步行速度</small>
              <span class="fw-bold text-dark d-block"
                >{{ record.gaitSpeed }} cm/s</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
