
export function headlineBadgeFaClass(tone) {
  if (tone === 'ok') return 'fa-solid fa-circle-check'
  if (tone === 'warn') return 'fa-solid fa-triangle-exclamation'
  if (tone === 'bad') return 'fa-solid fa-circle-xmark'
  return 'fa-solid fa-circle-info'
}
