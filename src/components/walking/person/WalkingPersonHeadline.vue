<script setup>
defineProps({
  headline: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section
    id="reportHeadline"
    class="headline clinical-headline"
    :data-status="headline.status"
  >
    <div class="headline-left">
      <div class="headline-badge" :data-tone="headline.status">
        <i
          :class="
            headline.status === 'watch'
              ? 'fa-solid fa-triangle-exclamation'
              : 'fa-solid fa-arrow-trend-up'
          "
        />
        <span>{{ headline.badge }}</span>
      </div>
      <div class="headline-text">
        <div class="headline-title">{{ headline.title }}</div>
        <div class="headline-desc">{{ headline.desc }}</div>
      </div>
    </div>
    <div class="headline-right">
      <div class="headline-meta">
        <div class="meta-label">比較區間</div>
        <div id="reportRange" class="meta-value">{{ headline.rangeText }}</div>
      </div>
    </div>
  </section>
</template>
