import { cleanupBootstrapModalArtifacts } from '@/utils/bootstrapCleanup'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

function getModalClass() {
  if (typeof window === 'undefined') return null
  return window.bootstrap?.Modal ?? null
}

/**
 * Bind Bootstrap 5 modal visibility to a v-model boolean.
 * Uses window.bootstrap from bootstrap.bundle (main.js).
 */
export function useBootstrapModal(modalRootRef, visible, onVisibleChange) {
  const instance = ref(null)

  function getInstance() {
    const el = modalRootRef.value
    const Modal = getModalClass()
    if (!el || !Modal) return null

    if (!instance.value) {
      instance.value = Modal.getOrCreateInstance(el, {
        backdrop: true,
        keyboard: true,
        focus: true,
      })
    }
    return instance.value
  }

  async function show() {
    await nextTick()
    getInstance()?.show()
  }

  function hide() {
    getInstance()?.hide()
  }

  function onHidden() {
    onVisibleChange(false)
  }

  function disposeInstance() {
    const el = modalRootRef.value
    const inst = instance.value

    if (!inst) {
      cleanupBootstrapModalArtifacts()
      return
    }

    const finalize = () => {
      inst.dispose()
      instance.value = null
      cleanupBootstrapModalArtifacts()
    }

    if (el?.classList.contains('show')) {
      el.addEventListener('hidden.bs.modal', finalize, { once: true })
      inst.hide()
    } else {
      finalize()
    }
  }

  watch(
    visible,
    (isOpen, wasOpen) => {
      if (isOpen) {
        show()
      } else if (wasOpen) {
        hide()
      }
    },
    { flush: 'post' },
  )

  watch(modalRootRef, (el, _, onCleanup) => {
    if (!el) return
    el.addEventListener('hidden.bs.modal', onHidden)
    onCleanup(() => {
      el.removeEventListener('hidden.bs.modal', onHidden)
    })
  })

  onBeforeUnmount(() => {
    disposeInstance()
  })

  return { show, hide }
}
