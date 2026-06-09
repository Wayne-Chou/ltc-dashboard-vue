<script setup>
import CompareControlRow from '@/components/dashboard/compare/CompareControlRow.vue'
import { useCompareModeInject } from '@/composables/useCompareMode'
import { computed } from 'vue'

const compare = useCompareModeInject()

const options = computed(() => compare.siteOptions())
</script>

<template>
  <div
    id="compareControls"
    :key="compare.controlsGeneration"
    class="compare-controls"
  >
    <CompareControlRow
      v-for="(site, index) in compare.selectedSites"
      :key="`${index}-${site.code}-${site.timeMode}-${compare.controlsGeneration}`"
      :index="index"
      :site="site"
      :site-options="options"
    />
  </div>
</template>

