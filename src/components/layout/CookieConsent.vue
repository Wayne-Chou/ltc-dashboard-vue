<script setup>
import { useCookieConsent } from '@/composables/useCookieConsent'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { isVisible, acceptConsent, dismissConsent, initConsent } = useCookieConsent()

const bannerStyle = computed(() => ({
  display: isVisible.value ? 'block' : 'none',
}))

const bannerCopy = computed(() => {
  void locale.value
  return {
    text: t('cookieConsentText'),
    accept: t('accept'),
    reject: t('reject'),
  }
})

onMounted(() => {
  initConsent()
})
</script>

<template>
  <div id="cookieConsent" :style="bannerStyle">
    <p data-i18n="cookieConsentText">
      {{ bannerCopy.text }}
    </p>
    <div class="d-flex justify-content-end gap-2">
      <button
        id="acceptCookies"
        type="button"
        class="btn btn-primary"
        data-i18n="accept"
        @click="acceptConsent"
      >
        {{ bannerCopy.accept }}
      </button>
      <button
        id="rejectCookies"
        type="button"
        class="btn btn-secondary"
        data-i18n="reject"
        @click="dismissConsent"
      >
        {{ bannerCopy.reject }}
      </button>
    </div>
  </div>
</template>
