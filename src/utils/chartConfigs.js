
function sortByDate(assessments) {
  return [...assessments].sort((a, b) => new Date(a.Date) - new Date(b.Date))
}

function padSinglePoint(labels, dataValues) {
  if (labels.length !== 1) {
    return { labels, dataValues, offset: 0, padded: false }
  }
  return {
    labels: ['', ...labels, ''],
    dataValues: [null, ...dataValues, null],
    offset: 1,
    padded: true,
  }
}

function formatShortLabel(timestamp) {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatFullDate(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function baseLineOptions(t) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        offset: true,
        title: { display: true, text: t('dashboard.dates'), font: { weight: 'bold' } },
        ticks: { autoSkip: true, maxTicksLimit: 7 },
      },
    },
  }
}

function dashedLineAnnotation(yValue, color = 'rgba(220, 53, 69, 0.75)') {
  return {
    type: 'line',
    yMin: yValue,
    yMax: yValue,
    borderColor: color,
    borderWidth: 2,
    borderDash: [6, 4],
  }
}

export function buildSitStandChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((d) => formatShortLabel(d.Date))
  let dataValues = sorted.map((d) => d.ChairSecond)
  const { labels: nextLabels, dataValues: nextValues, offset } = padSinglePoint(
    labels,
    dataValues,
  )
  labels = nextLabels
  dataValues = nextValues

  const baselineY = 12
  const validValues = dataValues.filter((v) => v !== null && !Number.isNaN(v))
  const minValue = Math.min(...validValues, baselineY)
  const maxValue = Math.max(...validValues, baselineY)
  let yMin = minValue - (maxValue - minValue) * 0.2
  let yMax = maxValue + (maxValue - minValue) * 0.2
  if (yMin < 0) yMin = 0
  if (yMax - yMin < 5) yMax = yMin + 5

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('dashboard.sitStand'),
          data: dataValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...baseLineOptions(t),
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            recommendLine: dashedLineAnnotation(baselineY, 'rgba(220, 53, 69, 0.75)'),
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y
              if (value === null) return ''
              const item = sorted[context.dataIndex - offset]
              if (!item) return ''
              return `${formatFullDate(item.Date)}：${value.toFixed(1)} ${t('dashboard.seconds')}`
            },
          },
        },
      },
      scales: {
        ...baseLineOptions(t).scales,
        y: {
          title: { display: true, text: t('dashboard.seconds'), font: { weight: 'bold' } },
          beginAtZero: false,
          min: Math.floor(yMin),
          max: Math.ceil(yMax),
        },
      },
    },
  }
}

export function buildBalanceChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((d) => formatShortLabel(d.Date))
  let dataValues = sorted.map((d) => d.BalanceScore)
  const { labels: nextLabels, dataValues: nextValues, offset } = padSinglePoint(labels, dataValues)
  labels = nextLabels
  dataValues = nextValues

  const recommendY = 3.5

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('dashboard.balanceScore'),
          data: dataValues,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...baseLineOptions(t),
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            recommendLine: dashedLineAnnotation(recommendY, 'rgba(25, 135, 84, 0.75)'),
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y
              if (value === null) return ''
              const item = sorted[context.dataIndex - offset]
              if (!item) return ''
              return `${formatFullDate(item.Date)}：${value.toFixed(1)} ${t('dashboard.points')}`
            },
          },
        },
      },
      scales: {
        ...baseLineOptions(t).scales,
        y: {
          title: { display: true, text: t('dashboard.points'), font: { weight: 'bold' } },
          beginAtZero: true,
          min: 0,
          max: 4,
          ticks: { stepSize: 1 },
        },
      },
    },
  }
}

export function buildGaitChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((d) => formatShortLabel(d.Date))
  let dataValues = sorted.map((d) => d.GaitSpeed)
  const { labels: nextLabels, dataValues: nextValues, offset } = padSinglePoint(labels, dataValues)
  labels = nextLabels
  dataValues = nextValues

  const baseline1 = 100
  const baseline2 = 80
  const validVals = dataValues.filter((v) => v !== null && !Number.isNaN(v))
  const minValue = Math.min(...validVals, baseline1, baseline2)
  const maxValue = Math.max(...validVals, baseline1, baseline2)
  let yMin = minValue - (maxValue - minValue) * 0.2
  let yMax = maxValue + (maxValue - minValue) * 0.2
  if (yMin < 0) yMin = 0
  if (yMax - yMin < 10) yMax = yMin + 10

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('dashboard.gaitSpeed'),
          data: dataValues,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...baseLineOptions(t),
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            recommend100: dashedLineAnnotation(baseline1, 'rgba(25, 135, 84, 0.75)'),
            recommend80: dashedLineAnnotation(baseline2, 'rgba(255, 193, 7, 0.85)'),
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y
              if (value === null) return ''
              const item = sorted[context.dataIndex - offset]
              if (!item) return ''
              return `${formatFullDate(item.Date)}：${value.toFixed(1)} cm/s`
            },
          },
        },
      },
      scales: {
        ...baseLineOptions(t).scales,
        y: {
          title: { display: true, text: 'cm/s', font: { weight: 'bold' } },
          beginAtZero: false,
          min: Math.floor(yMin),
          max: Math.ceil(yMax),
        },
      },
    },
  }
}

export function buildRiskChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((d) => formatShortLabel(d.Date))
  let dataValues = sorted.map((d) => d.RiskRate)
  const { labels: nextLabels, dataValues: nextValues, offset } = padSinglePoint(labels, dataValues)
  labels = nextLabels
  dataValues = nextValues

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('dashboard.fallRisk'),
          data: dataValues,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...baseLineOptions(t),
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y
              if (value === null) return ''
              const item = sorted[context.dataIndex - offset]
              if (!item) return ''
              return `${formatFullDate(item.Date)}：${value.toFixed(1)} %`
            },
          },
        },
      },
      scales: {
        ...baseLineOptions(t).scales,
        y: {
          title: {
            display: true,
            text: `${t('dashboard.fallRisk')} (%)`,
            font: { weight: 'bold' },
          },
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  }
}

const BUILDERS = {
  sitStand: buildSitStandChartConfig,
  balance: buildBalanceChartConfig,
  gait: buildGaitChartConfig,
  risk: buildRiskChartConfig,
}

export function buildTrendChartConfig(type, assessments, t) {
  const builder = BUILDERS[type]
  if (!builder) return null
  return builder(assessments, t)
}
