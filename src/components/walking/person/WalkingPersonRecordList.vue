<script setup>
const props = defineProps({
  records: {
    type: Array,
    required: true,
  },
  selectedIndices: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'select-all', 'unselect-all'])

function isChecked(index) {
  return props.selectedIndices.includes(index)
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title mb-0">
      <i class="fa-solid fa-table" />
      <span>評估紀錄明細</span>
    </h2>
    <div class="panel-header align-items-start">
      <div>
        <div class="panel-hint mt-0">可勾選評估紀錄以檢視步行相關趨勢</div>
      </div>
      <div class="panel-actions">
        <button id="checkAllBtn" type="button" class="btn-soft" @click="emit('select-all')">
          全選
        </button>
        <button
          id="uncheckAllBtn"
          type="button"
          class="btn-soft secondary"
          @click="emit('unselect-all')"
        >
          取消全選
        </button>
      </div>
    </div>

    <div class="panel-body">
      <div id="personTable" class="table-wrap">
        <div class="record-list">
          <label
            v-for="(record, index) in records"
            :key="record.date"
            class="record-item"
          >
            <input
              type="checkbox"
              class="row-check"
              :data-index="index"
              :checked="isChecked(index)"
              @change="emit('toggle', index)"
            />
            <div class="record-content w-100">
              <div class="record-date">{{ record.date }}</div>
              <div class="record-metrics">
                <span class="risk">
                  跌倒風險
                  <b :style="{ color: record.riskColor }">{{ record.risk }}</b>
                </span>
                <span>
                  步行速度
                  <b>{{ record.gait }} cm/s</b>
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
