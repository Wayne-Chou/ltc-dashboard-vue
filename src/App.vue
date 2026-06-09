<script setup>
import CookieConsent from '@/components/layout/CookieConsent.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showCookieConsent = computed(() => route.name === 'dashboard')
</script>

<template>
  <RouterView />
  <CookieConsent v-if="showCookieConsent" />
</template>
