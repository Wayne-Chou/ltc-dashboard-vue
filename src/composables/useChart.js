import Chart from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation'
import { onBeforeUnmount, shallowRef } from 'vue'

let registered = false

function ensureChartRegistered() {
  if (registered) return
  Chart.register(annotationPlugin)
  registered = true
}

/**
 * Chart.js lifecycle helper: create, update, destroy on unmount.
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef
 */
export function useChart(canvasRef) {
  ensureChartRegistered()

  const chart = shallowRef(null)

  function clearCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function destroyChart() {
    if (chart.value) {
      chart.value.destroy()
      chart.value = null
    }
  }

  function updateChart(config) {
    if (!canvasRef.value) return

    destroyChart()

    if (!config) {
      clearCanvas()
      return
    }

    chart.value = new Chart(canvasRef.value, config)
  }

  onBeforeUnmount(() => {
    destroyChart()
  })

  return {
    chart,
    updateChart,
    destroyChart,
    clearCanvas,
  }
}
