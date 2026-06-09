import { getCookie } from '@/utils/authSession'
import { useAppStore } from '@/stores/app'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const CONSENT_COOKIE_KEY = 'cookieConsent'
export const PREFERRED_LANG_KEY = 'preferredLang'
const CONSENT_EXPIRE_DAYS = 30

function setCookieDays(name, value, days) {
  if (typeof document === 'undefined') return
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`
}


export function useCookieConsent() {
  const { locale } = useI18n()
  const appStore = useAppStore()
  const isVisible = ref(false)

  function hasConsent() {
    return Boolean(getCookie(CONSENT_COOKIE_KEY))
  }

  function hideBanner() {
    isVisible.value = false
  }

  function acceptConsent() {
    setCookieDays(CONSENT_COOKIE_KEY, 'accepted', CONSENT_EXPIRE_DAYS)
    setCookieDays(PREFERRED_LANG_KEY, locale.value, CONSENT_EXPIRE_DAYS)
    hideBanner()
  }

  function dismissConsent() {
    setCookieDays(CONSENT_COOKIE_KEY, 'rejected', CONSENT_EXPIRE_DAYS)
    hideBanner()
  }

  function initConsent() {
    const consentStatus = getCookie(CONSENT_COOKIE_KEY)

    if (!consentStatus) {
      isVisible.value = true
      return
    }

    isVisible.value = false

    if (consentStatus === 'accepted') {
      const savedLang = getCookie(PREFERRED_LANG_KEY)
      if (savedLang && savedLang !== locale.value) {
        appStore.setLocale(savedLang)
      }
    }
  }

  return {
    isVisible,
    hasConsent,
    acceptConsent,
    dismissConsent,
    initConsent,
  }
}
