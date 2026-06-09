import flatpickr from 'flatpickr'
import { MandarinTraditional } from 'flatpickr/dist/l10n/zh-tw.js'
import { formatDateForCompare } from '@/utils/compareMode'
import { nextTick, onBeforeUnmount, watch } from 'vue'

import 'flatpickr/dist/flatpickr.min.css'

/**
 * — @see compareMode.js initFlatpickr
 * @param {import('vue').Ref<HTMLInputElement|null>} inputRef
 * @param {() => object} getSite
 * @param {'range'|'single'|'multiple'} mode
 * @param {{ onRange: (start: Date, end: Date) => void, onSingle: (date: Date) => void, onMultiple: (dates: Date[]) => void, getDateRange: (code: string) => Promise<{minDate,maxDate,enabledDates}> }} handlers
 */
export function useCompareFlatpickr(inputRef, getSite, mode, handlers) {
  let instance = null

  function destroy() {
    if (instance) {
      instance.destroy()
      instance = null
    }
  }

  async function init() {
    if (!inputRef.value) return
    destroy()

    const site = getSite()
    if (!site?.code) return

    const { minDate, maxDate, enabledDates } = await handlers.getDateRange(site.code)

    const config = {
      dateFormat: 'Y-m-d',
      locale: MandarinTraditional,
      minDate,
      maxDate,
      rangeSeparator: ' ~ ',
    }

    if (mode === 'range') {
      config.mode = 'range'
      config.onChange = (dates) => {
        if (!Array.isArray(dates) || dates.length !== 2) return
        handlers.onRange(dates[0], dates[1])
      }
    }

    if (mode === 'single') {
      config.mode = 'single'
      config.defaultDate = site.end || site.start || null
      config.enable = enabledDates
      config.onChange = (dates) => {
        if (dates[0]) {
          handlers.onSingle(dates[0])
        }
      }
    }

    if (mode === 'multiple') {
      config.mode = 'multiple'
      config.defaultDate = Array.isArray(site.selectedDates) ? site.selectedDates : null
      config.enable = enabledDates
      config.onChange = (dates) => {
        handlers.onMultiple(dates)
        void nextTick(() => {
          if (instance?.input) {
            instance.input.style.width = `${instance.input.scrollWidth + 24}px`
            instance.input.scrollLeft = instance.input.scrollWidth
          }
        })
      }
    }

    instance = flatpickr(inputRef.value, config)

    if (mode === 'range' && site.start && site.end) {
      instance.setDate([site.start, site.end], false)
      instance.input.value = `${site.start} ~ ${site.end}`
    }

    if (mode === 'multiple') {
      void nextTick(() => {
        if (instance?.input) {
          instance.input.style.width = `${instance.input.scrollWidth + 24}px`
          instance.input.scrollLeft = instance.input.scrollWidth
        }
      })
    }
  }

  watch(
    inputRef,
    (el) => {
      if (el) void init()
    },
    { immediate: true },
  )

  onBeforeUnmount(destroy)

  return { destroy, reinit: init }
}

export { formatDateForCompare }
