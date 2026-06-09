<script setup>
import { useCompareFlatpickr } from '@/composables/useCompareFlatpickr'
import { useCompareModeInject } from '@/composables/useCompareMode'
import { computed, ref } from 'vue'

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  site: {
    type: Object,
    required: true,
  },
  siteOptions: {
    type: Array,
    default: () => [],
  },
})

const compare = useCompareModeInject()

const rangeRef = ref(null)
const singleRef = ref(null)
const multipleRef = ref(null)

const getSite = () => compare.selectedSites[props.index]

const handlers = {
  getDateRange: (code) => compare.getCachedDateRange(code),
  onRange: (start, end) => compare.onRangeSelected(props.index, start, end),
  onSingle: (date) => compare.onSingleSelected(props.index, date),
  onMultiple: (dates) => compare.onMultipleSelected(props.index, dates),
}

const showRange = computed(() => props.site.timeMode === 'range')
const showSingle = computed(() => props.site.timeMode === 'single')
const showMultiple = computed(() => props.site.timeMode === 'multiple')

const groupLabel = computed(() => (props.index === 0 ? '比較組' : '對照組'))

useCompareFlatpickr(rangeRef, getSite, 'range', handlers)
useCompareFlatpickr(singleRef, getSite, 'single', handlers)
useCompareFlatpickr(multipleRef, getSite, 'multiple', handlers)

function onSiteSelect(event) {
  void compare.onSiteChange(props.index, event.target.value)
}

function onModeSelect(event) {
  compare.onTimeModeChange(props.index, event.target.value)
}
</script>

<template>
  <div class="compare-control" :data-compare-index="index">
    <div class="compare-control-label">
      <i class="fa-solid fa-circle" />
      {{ groupLabel }}
    </div>

    <select
      class="form-select form-select-sm"
      data-compare-site
      :data-compare-index="index"
      :value="site.code"
      @change="onSiteSelect"
    >
      <option v-for="opt in siteOptions" :key="opt.code" :value="opt.code">
        {{ opt.name }}
      </option>
    </select>

    <select
      class="form-select form-select-sm"
      data-compare-field="timeMode"
      :data-compare-index="index"
      :value="site.timeMode"
      @change="onModeSelect"
    >
      <option value="range">區間</option>
      <option value="single">單日</option>
      <option value="multiple">自選日期</option>
    </select>

    <div class="compare-date-group">
      <div class="compare-date-range-wrap" :class="{ 'd-none': !showRange }">
        <input
          ref="rangeRef"
          type="text"
          class="form-control form-control-sm compare-flatpickr-input"
          data-flatpickr-range
          :data-compare-index="index"
          :value="compare.rangeDisplayValue(site)"
          placeholder="選擇日期區間"
          readonly
        />
      </div>

      <div class="compare-date-single-wrap" :class="{ 'd-none': !showSingle }">
        <input
          ref="singleRef"
          type="text"
          class="form-control form-control-sm compare-flatpickr-input"
          data-flatpickr-single
          :data-compare-index="index"
          :value="compare.singleDisplayValue(site)"
          placeholder="選擇單日"
          readonly
        />
      </div>

      <div class="compare-date-multiple-wrap" :class="{ 'd-none': !showMultiple }">
        <input
          ref="multipleRef"
          type="text"
          class="form-control form-control-sm compare-flatpickr-input"
          data-flatpickr-multiple
          :data-compare-index="index"
          :value="compare.multipleDisplayValue(site)"
          placeholder="選擇多個日期"
          readonly
        />
      </div>

      <div class="compare-quick-actions">
        <button
          type="button"
          class="compare-quick-btn"
          data-quick="year"
          :data-compare-index="index"
          @click="compare.applyQuickRange(index, 'year')"
        >
          <i class="fa-solid fa-calendar" /> 今年
        </button>
        <button
          type="button"
          class="compare-quick-btn"
          data-quick="6m"
          :data-compare-index="index"
          @click="compare.applyQuickRange(index, '6m')"
        >
          <i class="fa-solid fa-calendar-week" /> 最近半年
        </button>
        <button
          type="button"
          class="compare-quick-btn"
          data-quick="30d"
          :data-compare-index="index"
          @click="compare.applyQuickRange(index, '30d')"
        >
          <i class="fa-solid fa-calendar-days" /> 最近1個月
        </button>
        <button
          type="button"
          class="compare-quick-btn compare-quick-btn-clear"
          data-clear
          :data-compare-index="index"
          @click="compare.clearSiteDates(index)">
          清除
        </button>
      </div>
    </div>
  </div>
</template>
