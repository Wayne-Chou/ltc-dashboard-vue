import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import i18n, { LOCALE_STORAGE_KEY } from '@/i18n'

export const useAppStore = defineStore('app', () => {
  const locale = ref(i18n.global.locale.value)
  const isLoading = ref(false)

  function setLocale(value) {
    locale.value = value
    i18n.global.locale.value = value
    localStorage.setItem(LOCALE_STORAGE_KEY, value)
  }

  function setLoading(value) {
    isLoading.value = value
  }

  watch(
    () => i18n.global.locale.value,
    (value) => {
      locale.value = value
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
    },
  )

  return {
    locale,
    isLoading,
    setLocale,
    setLoading,
  }
})
