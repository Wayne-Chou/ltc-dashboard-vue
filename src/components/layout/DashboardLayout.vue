<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/dashboard.css'

defineProps({
  sites: {
    type: Array,
    default: () => [],
  },
  showRegionSections: {
    type: Boolean,
    default: false,
  },
  error: {
    default: null,
  },
})

defineEmits(['select-region'])
</script>

<template>
  <div class="custom-container content bg-white">
    <div class="page-wrapper">
      <AppSidebar
        :sites="sites"
        :show-region-sections="showRegionSections"
        :error="error"
        @select-region="$emit('select-region', $event)"
      />

      <div class="main-content">
        <slot />
      </div>
    </div>
  </div>
</template>
