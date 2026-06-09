/**
 * Remove leftover Bootstrap modal artifacts that block clicks (e.g. header dropdown).
 */
export function cleanupBootstrapModalArtifacts() {
  if (typeof document === 'undefined') return

  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
  document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
}
