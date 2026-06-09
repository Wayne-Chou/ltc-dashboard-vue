import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import zh from './locales/zh.json'
import { personDetailMessages } from './personDetailMessages'

const LOCALE_STORAGE_KEY = 'ltc_locale'

function getInitialLocale() {
  if (typeof localStorage === 'undefined') return 'zh'
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && ['zh', 'en', 'ja', 'ko'].includes(saved)) {
    return saved
  }
  return 'zh'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: {
    ko: ['zh'],
    default: 'en',
  },
  messages: {
    zh: { ...zh, personDetail: personDetailMessages.zh },
    en: { ...en, personDetail: personDetailMessages.en },
    ja: { ...ja, personDetail: personDetailMessages.ja ?? personDetailMessages.zh },
    ko: { ...ko, personDetail: personDetailMessages.ko ?? personDetailMessages.zh },
  },
})

export { LOCALE_STORAGE_KEY }
export default i18n
