import flatpickr from 'flatpickr'
import { Japanese } from 'flatpickr/dist/l10n/ja.js'
import { MandarinTraditional } from 'flatpickr/dist/l10n/zh-tw.js'
import { onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import 'flatpickr/dist/flatpickr.min.css'

function getFlatpickrLocale(lang) {
  const l = (lang || 'zh').toLowerCase()
  if (l.includes('zh')) return MandarinTraditional
  if (l.includes('ja')) return Japanese
  return undefined
}

/**

 * @param {import('vue').Ref<HTMLInputElement|null>} inputRef
 * @param {{ onRangeSelected: (start: Date, end: Date) => void, onClear: () => void }} callbacks
 */
export function usePersonFlatpickr(inputRef, callbacks) {
  const { t, locale } = useI18n()
  let instance = null

  function destroy() {
    if (instance) {
      instance.destroy()
      instance = null
    }
  }

  function init() {
    if (!inputRef.value) return
    destroy()

    instance = flatpickr(inputRef.value, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'Y/m/d',
      locale: getFlatpickrLocale(locale.value),
      onReady(_selectedDates, _dateStr, fp) {
        if (fp.altInput) {
          fp.altInput.placeholder = t('personDetail.dateRangePlaceholder')
        }
      },
      onChange(selectedDates) {
        if (selectedDates.length === 2) {
          callbacks.onRangeSelected(selectedDates[0], selectedDates[1])
        }
      },
    })
  }

  function clear() {
    instance?.clear()
    callbacks.onClear()
  }

  watch(
    () => locale.value,
    () => {
      if (instance) {
        instance.set('locale', getFlatpickrLocale(locale.value))
        if (instance.altInput) {
          instance.altInput.placeholder = t('personDetail.dateRangePlaceholder')
        }
      }
    },
  )

  watch(
    inputRef,
    (el) => {
      if (el) init()
    },
    { immediate: true },
  )

  onBeforeUnmount(destroy)

  return { clear, destroy }
}
