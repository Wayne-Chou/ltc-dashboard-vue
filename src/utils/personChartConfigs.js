
function sortByDate(assessments) {
  return [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  )
}

function padSinglePoint(labels, dataValues) {
  if (labels.length !== 1) {
    return { labels, dataValues }
  }
  return {
    labels: ['', ...labels, ''],
    dataValues: [null, ...dataValues, null],
  }
}

function shortLabel(timestamp) {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function buildPersonSitStandChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((item) => shortLabel(item.Date))
  let dataValues = sorted.map((item) => item.ChairSecond)
  ;({ labels, dataValues } = padSinglePoint(labels, dataValues))

  const baselineY = 12
  const validValues = dataValues.filter((value) => value != null && !Number.isNaN(value))
  const minValue = Math.min(...validValues, baselineY)
  const maxValue = Math.max(...validValues, baselineY)
  let yMin = Math.max(0, minValue - (maxValue - minValue) * 0.2)
  let yMax = maxValue + (maxValue - minValue) * 0.2
  if (yMax - yMin < 5) yMax = yMin + 5

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('personDetail.sitStand'),
          data: dataValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${t('personDetail.sitStand')}：${ctx.parsed.y?.toFixed(1) ?? '-'} ${t('personDetail.seconds')}`,
          },
        },
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: { display: true, text: t('personDetail.seconds') },
        },
      },
    },
  }
}

export function buildPersonBalanceChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((item) => shortLabel(item.Date))
  let dataValues = sorted.map((item) => item.BalanceScore)
  ;({ labels, dataValues } = padSinglePoint(labels, dataValues))

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('personDetail.balanceTrend'),
          data: dataValues,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 3,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 4 } },
    },
  }
}

export function buildPersonGaitChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((item) => shortLabel(item.Date))
  let dataValues = sorted.map((item) => item.GaitSpeed)
  ;({ labels, dataValues } = padSinglePoint(labels, dataValues))

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('personDetail.gaitSpeed'),
          data: dataValues,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  }
}

export function buildPersonRiskChartConfig(assessments, t) {
  const sorted = sortByDate(assessments)
  let labels = sorted.map((item) => shortLabel(item.Date))
  let dataValues = sorted.map((item) => item.RiskRate)
  ;({ labels, dataValues } = padSinglePoint(labels, dataValues))

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('personDetail.fallRisk'),
          data: dataValues,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.3)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  }
}

const BUILDERS = {
  sitStand: buildPersonSitStandChartConfig,
  balance: buildPersonBalanceChartConfig,
  gait: buildPersonGaitChartConfig,
  risk: buildPersonRiskChartConfig,
}

export function buildPersonChartConfig(type, assessments, t) {
  const builder = BUILDERS[type]
  if (!builder) return null
  return builder(assessments, t)
}
