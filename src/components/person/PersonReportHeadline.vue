<script setup>
import { headlineBadgeFaClass } from '@/utils/personDetailIcons'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  headline: { type: Object, required: true },
  clinicalStatus: { type: String, default: 'neutral' },
})

const { t } = useI18n()

const badgeFaClass = computed(() => headlineBadgeFaClass(props.headline.tone))
</script>

<template>
  <section
    id="reportHeadline"
    class="headline clinical-headline"
    :data-status="clinicalStatus"
  >
    <div class="headline-left">
      <div class="headline-badge" :data-tone="headline.tone">
        <i :class="badgeFaClass" />
        <span>{{ t(`personDetail.headline.status.${headline.statusKey}`) }}</span>
      </div>
      <div class="headline-text">
        <div class="headline-title">{{ t(`personDetail.headline.title.${headline.titleKey}`) }}</div>
        <div class="headline-desc">{{ t(`personDetail.headline.desc.${headline.descKey}`) }}</div>
      </div>
    </div>

    <div class="headline-right">
      <div class="headline-meta">
        <div class="meta-label">{{ t('personDetail.compareRange') }}</div>
        <div id="reportRange" class="meta-value">{{ headline.rangeText }}</div>
      </div>
    </div>
  </section>
</template>
