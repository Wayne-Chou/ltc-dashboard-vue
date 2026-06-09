
/**
 * Export a chart canvas as PNG with white background.
 * @param {HTMLCanvasElement|null} canvas
 * @param {string} targetId
 */
export function downloadChartAsPng(canvas, targetId) {
  if (!canvas) {
    console.warn(`[DownloadChart] Canvas not found: ${targetId}`)
    return
  }

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return

  tempCtx.fillStyle = '#ffffff'
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
  tempCtx.drawImage(canvas, 0, 0)

  const image = tempCanvas.toDataURL('image/png', 1.0)
  const dateStr = new Date().toISOString().slice(0, 10)
  const fileName = `Chart_${targetId}_${dateStr}.png`

  const link = document.createElement('a')
  link.href = image
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
