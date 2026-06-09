
let loadingCount = 0

export function showGlobalLoading() {
  loadingCount += 1
  if (typeof document !== 'undefined') {
    document.body.classList.add('is-loading')
  }
}

export function hideGlobalLoading() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0 && typeof document !== 'undefined') {
    document.body.classList.remove('is-loading')
  }
}

/** Clear overlay after session expiry or forced navigation */
export function resetGlobalLoading() {
  loadingCount = 0
  if (typeof document !== 'undefined') {
    document.body.classList.remove('is-loading')
  }
}
