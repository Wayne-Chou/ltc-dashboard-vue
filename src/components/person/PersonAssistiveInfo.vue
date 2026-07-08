<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  assistiveDevice: {
    default: null,
    validator: (value) =>
      value === null || typeof value === 'boolean' || typeof value === 'string',
  },
})

const { t } = useI18n()

const status = computed(() => {
  if (props.assistiveDevice === true) {
    return { key: 'yes', className: 'assistive-status yes' }
  }
  if (props.assistiveDevice === false) {
    return { key: 'no', className: 'assistive-status no' }
  }
  if (typeof props.assistiveDevice === 'string') {
    const normalized = props.assistiveDevice.trim().toLowerCase()
    if (['yes', 'true', '1', 'y'].includes(normalized)) {
      return { key: 'yes', className: 'assistive-status yes' }
    }
    if (['no', 'false', '0', 'n'].includes(normalized)) {
      return { key: 'no', className: 'assistive-status no' }
    }
  }
  return { key: 'unknown', className: 'assistive-status unknown' }
})
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title mb-0">
        <i class="fa-solid fa-wheelchair-move" />
        <span>{{ t('personDetail.assistiveDevice.title') }}</span>
      </h2>
    </div>
    <div class="panel-body">
      <div class="assistive-row mt-2">
        <span class="assistive-label">{{ t('personDetail.assistiveDevice.label') }}</span>
        <span :class="status.className">
          {{ t(`personDetail.assistiveDevice.status.${status.key}`) }}
        </span>
      </div>
    </div>
  </section>
</template>
