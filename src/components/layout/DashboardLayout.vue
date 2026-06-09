<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/dashboard.css'

defineProps({
  sites: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select-region'])
</script>

<template>
  <div class="custom-container content bg-white">
    <div class="page-wrapper">
      <AppSidebar :sites="sites" @select-region="$emit('select-region', $event)" />

      <div class="main-content">
        <slot />
      </div>
    </div>
  </div>
</template>
