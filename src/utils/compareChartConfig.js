import { COMPARE_COLORS, formatDateForCompare } from '@/utils/compareMode'

function formatLocalDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

const FIELD_MAP = {
  ChairSecond: 'ChairSecond',
  BalanceScore: 'BalanceScore',
  GaitSpeed: 'GaitSpeed',
  RiskRate: 'RiskRate',
}

/**
 * @param {Array} groupedData
 * @param {string} dataKey — assessment field name
 * @param {{ unit?: string, format?: (v: number) => string }} options
 */
export function buildCompareMultiLineChartConfig(groupedData, dataKey, options = {}) {
  const { unit = '', format = (v) => v.toFixed(1) } = options
  const key = FIELD_MAP[dataKey] || dataKey

  const allDatesSet = new Set()
  groupedData.forEach((group) => {
    group.data.forEach((d) => allDatesSet.add(d.Date))
  })
  const allDates = [...allDatesSet].sort((a, b) => new Date(a) - new Date(b))
  const labels = allDates.map(formatLocalDate)

  const datasets = groupedData.map((group, index) => {
    if (group.timeMode === 'multiple') {
      const values = group.data
        .map((d) => Number(d[key]))
        .filter((v) => Number.isFinite(v))

      const avg =
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null

      return {
        label: `${group.site}（自選日期平均）`,
        data:
          avg != null
            ? [
                {
                  x: group.site,
                  y: avg,
                },
              ]
            : [],
        borderColor: COMPARE_COLORS[index % COMPARE_COLORS.length],
        backgroundColor: COMPARE_COLORS[index % COMPARE_COLORS.length],
        pointRadius: 6,
        showLine: false,
      }
    }

    const dataMap = new Map()
    group.data.forEach((d) => dataMap.set(d.Date, d[key]))

    const color = COMPARE_COLORS[index % COMPARE_COLORS.length]

    return {
      label: group.site,
      data: allDates.map((date) => dataMap.get(date) ?? null),
      borderColor: color,
      backgroundColor: `${color}20`,
      tension: 0.3,
      fill: false,
      spanGaps: true,
      pointRadius: 4,
      borderWidth: 3,
    }
  })

  const hideXTicks = groupedData.every((g) => g.timeMode === 'multiple')

  return {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          callbacks: {
            title: (items) => {
              const dataset = items[0].dataset
              if (dataset.label.includes('自選日期')) {
                return ''
              }
              return items[0].label
            },
            label: (ctx) => {
              const value = ctx.parsed.y
              if (value == null) return ''
              return `${ctx.dataset.label}: ${format(value)} ${unit}`
            },
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          grid: { display: false },
          ticks: {
            display: !hideXTicks,
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: unit,
            font: { weight: 'bold' },
          },
          ticks: {
            callback: (value) => `${format(value)}${unit}`,
          },
        },
      },
    },
  }
}

export const COMPARE_CHART_SPECS = [
  {
    canvasId: 'sitStandChartCanvas',
    dataKey: 'ChairSecond',
    title: '平均坐站秒數',
    hint: '建議小於12秒',
    unit: '秒',
  },
  {
    canvasId: 'balanceChartCanvas',
    dataKey: 'BalanceScore',
    title: '平均平衡測驗得分',
    hint: '建議大於3.5分',
    unit: '分',
  },
  {
    canvasId: 'gaitChartCanvas',
    dataKey: 'GaitSpeed',
    title: '平均步行速度趨勢',
    hint: '建議大於等於100cm/s',
    unit: 'cm/s',
  },
  {
    canvasId: 'riskChartCanvas',
    dataKey: 'RiskRate',
    title: '平均AI跌倒風險機率',
    hint: '',
    unit: '%',
    hintHidden: true,
  },
]
