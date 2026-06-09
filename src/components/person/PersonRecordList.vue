<script setup>
import { usePersonFlatpickr } from '@/composables/usePersonFlatpickr'
import { formatLocaleDate, getRiskColor, getRiskLabelKey } from '@/utils/personDetail'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  records: { type: Array, default: () => [] },
  selectedIndices: { type: Array, default: () => [] },
  recordPanelHint: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle',
  'select-all',
  'unselect-all',
  'range-selected',
  'clear-dates',
])

const { t } = useI18n()
const dateRangeInputRef = ref(null)

const { clear: clearFlatpickr } = usePersonFlatpickr(dateRangeInputRef, {
  onRangeSelected(start, end) {
    emit('range-selected', { start, end })
  },
  onClear() {
    emit('clear-dates')
  },
})

function isChecked(index) {
  return props.selectedIndices.includes(index)
}

function formatSitStand(record) {
  const value = record.SPPB?.Chairtest?.Second
  return value != null ? `${value.toFixed(2)} ${t('personDetail.seconds')}` : '-'
}

function formatGait(record) {
  const value = record.SPPB?.Gaitspeed?.Speed
  return value != null ? `${value.toFixed(2)} cm/s` : '-'
}

function onClearClick() {
  clearFlatpickr()
}

defineExpose({ clearFlatpickr })
</script>

<template>
  <section class="panel">
    <h2 class="panel-title mb-0">
      <i class="fa-solid fa-table" />
      <span>{{ t('personDetail.panelRecordList') }}</span>
    </h2>
    <div class="panel-header align-items-start">
      <div>
        <div class="panel-hint mt-0">
          {{ recordPanelHint }}
        </div>
      </div>
      <div class="panel-actions">
        <button id="checkAllBtn" type="button" class="btn-soft" @click="emit('select-all')">
          {{ t('personDetail.selectAll') }}
        </button>
        <button id="uncheckAllBtn" type="button" class="btn-soft secondary" @click="emit('unselect-all')">
          {{ t('personDetail.unselectAll') }}
        </button>
      </div>
    </div>

    <div class="panel-body">
      <div class="panel-filters">
        <div class="input-group">
          <input
            id="dateRange"
            ref="dateRangeInputRef"
            type="text"
            class="form-control flatpickr-input"
            readonly
          />
          <button id="clearBtn" type="button" class="btn btn-outline-secondary" @click="onClearClick">
            {{ t('personDetail.clear') }}
          </button>
        </div>
      </div>

      <div id="personTable" class="table-wrap">
        <div v-if="!records.length" class="text-muted py-3 text-center">
          {{ t('personDetail.alertNoData') }}
        </div>
        <div v-else class="record-list">
          <label
            v-for="(record, index) in records"
            :key="`${record.Date}-${index}`"
            class="record-item"
          >
            <input
              type="checkbox"
              class="row-check"
              :data-index="index"
              :checked="isChecked(index)"
              @change="emit('toggle', index, $event.target.checked)"
            />
            <div class="record-content w-100">
              <div class="record-date">{{ formatLocaleDate(record.Date) }}</div>
              <div class="record-metrics">
                <span>{{ t('personDetail.sitStand') }} <b>{{ formatSitStand(record) }}</b></span>
                <span>{{ t('personDetail.gaitSpeed') }} <b>{{ formatGait(record) }}</b></span>
                <span class="risk">
                  {{ t('personDetail.fallRisk') }}
                  <b :style="{ color: getRiskColor(record.Risk) }">
                    {{ t(`personDetail.riskLabel.${getRiskLabelKey(record.Risk)}`) }}
                  </b>
                </span>
              </div>
              <div class="record-balance">
                <div class="balance-title">{{ t('personDetail.balance') }}</div>
                <ul class="balance-list mb-0">
                  <li>
                    {{ t('personDetail.balance1') }}：
                    <b>{{ record.SPPB?.Balancetest?.balance1?.Score ?? '-' }}</b>
                  </li>
                  <li>
                    {{ t('personDetail.balance2') }}：
                    <b>{{ record.SPPB?.Balancetest?.balance2?.Score ?? '-' }}</b>
                  </li>
                  <li>
                    {{ t('personDetail.balance3') }}：
                    <b>{{ record.SPPB?.Balancetest?.balance3?.Score ?? '-' }}</b>
                  </li>
                </ul>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
