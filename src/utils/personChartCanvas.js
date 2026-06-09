
export function drawPersonChartNoData(canvas, message) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#888'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(message, canvas.width / 2, canvas.height / 2)
}
