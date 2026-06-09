
export const COMPARE_SELECTED_SITES_MAX = 2

export const COMPARE_COLORS = ['#3b82f6', '#ef4444']

export const COMPARE_METRICS = [
  {
    key: 'chair',
    label: '坐站',
    unit: '秒',
    better: 'min',
    threshold: 12,
    alertText: '偏慢',
    icon: 'fa-chair',
  },
  {
    key: 'balance',
    label: '平衡',
    unit: '分',
    better: 'max',
    threshold: 3.5,
    alertText: '偏低',
    icon: 'fa-scale-balanced',
  },
  {
    key: 'gait',
    label: '步行速度',
    unit: 'cm/s',
    better: 'max',
    threshold: 100,
    alertText: '偏慢',
    icon: 'fa-person-walking',
  },
  {
    key: 'risk',
    label: 'AI風險機率',
    unit: '%',
    better: 'min',
    icon: 'fa-shield-heart',
  },
]

export function formatDateForCompare(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDisplayDate(date) {
  if (!date) return ''
  return formatDateForCompare(new Date(date))
}

export function filterByDates(data, selectedDates) {
  if (!Array.isArray(data)) return []
  if (!Array.isArray(selectedDates) || selectedDates.length === 0) return data

  const set = new Set(selectedDates)
  return data.filter((item) => {
    const date = new Date(item.Date)
    if (!Number.isFinite(date.getTime())) return false
    return set.has(formatDateForCompare(date))
  })
}

export function toTimestampRange(start, end) {
  const s = new Date(start)
  const e = new Date(end || start)

  const startUTC = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0)
  const endUTC = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate() + 1, 0, 0, 0)

  return { start: startUTC, end: endUTC }
}

export function getMetricValue(data, key, timeMode) {
  if (!Array.isArray(data) || !data.length) return null

  const fieldMap = {
    chair: 'ChairSecond',
    balance: 'BalanceScore',
    gait: 'GaitSpeed',
    risk: 'RiskRate',
  }
  const field = fieldMap[key] || key

  if (timeMode === 'range' || timeMode === 'multiple') {
    const values = data.map((d) => Number(d[field])).filter((v) => Number.isFinite(v))
    if (!values.length) return null
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  if (timeMode === 'single') {
    const value = Number(data[data.length - 1][field])
    return Number.isFinite(value) ? value : null
  }

  return null
}

export function getTimeDisplay(row) {
  if (row.timeMode === 'single') {
    return {
      label: '單日資料',
      text: new Date(row.end).toLocaleDateString('zh-TW'),
    }
  }

  if (row.timeMode === 'multiple') {
    return {
      label: '自選日期',
      text:
        row.selectedDates?.map((d) => new Date(d).toLocaleDateString('zh-TW')).join('、') || '',
    }
  }

  return {
    label: '區間平均',
    text: `${new Date(row.start).toLocaleDateString('zh-TW')}～${new Date(row.end).toLocaleDateString('zh-TW')}`,
  }
}

export function getShortDateText(row) {
  if (!row) return ''

  if (row.timeMode === 'multiple') {
    const dates = (row.selectedDates || []).map((d) =>
      new Date(d).toLocaleDateString('zh-TW'),
    )
    if (dates.length === 0) return ''
    if (dates.length === 1) return dates[0]
    if (dates.length === 2) return dates.join('、')
    return `${dates[0]}、${dates[1]} ...`
  }

  if (row.timeMode === 'single') {
    return new Date(row.end).toLocaleDateString('zh-TW')
  }

  return `${new Date(row.start).toLocaleDateString('zh-TW')}～${new Date(row.end).toLocaleDateString('zh-TW')}`
}

export function getChartHintText(sites) {
  const modes = new Set((sites || []).map((s) => s.timeMode))

  if (modes.size > 1) {
    return '各據點依不同時間模式呈現，請留意比較基準'
  }

  const mode = sites[0]?.timeMode

  switch (mode) {
    case 'single':
      return '圖表顯示單日數據'
    case 'range':
      return '圖表顯示每日變化，摘要為區間平均'
    case 'multiple':
      return '圖表顯示選取日期之平均結果'
    default:
      return ''
  }
}

function roundMetric(v) {
  return Math.round(v * 10) / 10
}

export function buildCompareSummaryModel(groupedData) {
  const emptyRange = {
    kind: 'empty-range',
    title: '比較結果',
    ranking: [],
    cards: [],
  }

  if (!groupedData) {
    return emptyRange
  }

  const allSitesNoData =
    groupedData.length > 0 &&
    groupedData.every((g) => !Array.isArray(g.data) || g.data.length === 0)

  if (allSitesNoData) {
    return emptyRange
  }

  const rows = groupedData
    .map((group, index) => ({
      site: group.site,
      id: `${group.code}-${index}`,
      code: group.code,
      timeMode: group.timeMode,
      selectedDates: group.selectedDates,
      start: group.start,
      end: group.end,
      chair: getMetricValue(group.data, 'chair', group.timeMode),
      balance: getMetricValue(group.data, 'balance', group.timeMode),
      gait: getMetricValue(group.data, 'gait', group.timeMode),
      risk: getMetricValue(group.data, 'risk', group.timeMode),
    }))
    .filter(Boolean)

  const isSameSite =
    groupedData.length === 2 && groupedData[0].code === groupedData[1].code
  const siteLabel0 = rows[0]?.site || 'A'
  const siteLabel1 = rows[1]?.site || 'B'
  const title = isSameSite ? '比較結果' : `${siteLabel0} vs ${siteLabel1} 比較結果`

  let ranking = []

  if (!isSameSite && rows.length >= 2) {
    const scoreMap = {}
    COMPARE_METRICS.forEach((metric) => {
      const valid = rows.filter((r) => r[metric.key] != null)
      if (valid.length < 2) return

      const sorted = [...valid].sort((a, b) =>
        metric.better === 'min'
          ? a[metric.key] - b[metric.key]
          : b[metric.key] - a[metric.key],
      )

      const best = sorted[0]
      const worst = sorted[sorted.length - 1]
      const diff = Math.abs(best[metric.key] - worst[metric.key])
      if (diff === 0) return
      scoreMap[best.id] = (scoreMap[best.id] || 0) + 1
    })

    ranking = Object.entries(scoreMap)
      .map(([id, score]) => {
        const row = rows.find((r) => r.id === id)
        return { id, site: row?.site, score }
      })
      .sort((a, b) => b.score - a.score)

    if (ranking.length <= 1) {
      ranking = []
    }
  }

  const A = rows[0]
  const B = rows[1]

  const cards = COMPARE_METRICS.map((metric) => {
    if (!A || !B) return null

    const AValue = A[metric.key]
    const BValue = B[metric.key]
    if (AValue == null || BValue == null) return null

    const ADisplay = roundMetric(AValue)
    const BDisplay = roundMetric(BValue)
    const isABetter =
      metric.better === 'min' ? AValue < BValue : AValue > BValue
    const best = isABetter ? A : B
    const worst = isABetter ? B : A
    const diff = Math.abs(ADisplay - BDisplay)
    const isTie = diff === 0
    const unitText = metric.unit ? ` ${metric.unit}` : ''
    const ADisplayInfo = getTimeDisplay(A)
    const BDisplayInfo = getTimeDisplay(B)

    const siteWithRole = (row) =>
      row.id === A.id ? `${A.site}（比較組）` : `${B.site}（對照組）`

    return {
      key: metric.key,
      label: metric.label,
      icon: metric.icon,
      unitText,
      isTie,
      isSameSite,
      aClass: isTie ? '' : isABetter ? 'is-better' : 'is-worse',
      bClass: isTie ? '' : isABetter ? 'is-worse' : 'is-better',
      cardClass: isTie ? 'is-tie' : 'is-active',
      aSite: A.site,
      bSite: B.site,
      aValue: AValue.toFixed(1),
      bValue: BValue.toFixed(1),
      aTimeLabel: ADisplayInfo.label,
      bTimeLabel: BDisplayInfo.label,
      aDatesTitle: (A.selectedDates || []).join(', '),
      bDatesTitle: (B.selectedDates || []).join(', '),
      topSiteText: isTie
        ? '表現相同'
        : isABetter
          ? `${A.site}（比較組）較佳`
          : `${B.site}（對照組）較佳`,
      badgeText: isSameSite ? null : isTie ? '平手' : '最佳',
      badgeNeutral: isTie && !isSameSite,
      compareText: isTie
        ? '雙方數值相同'
        : isABetter
          ? `${A.site}（比較組）表現優於 ${B.site}（對照組）`
          : `${B.site}（對照組）表現優於 ${A.site}（比較組）`,
      diffText: isTie ? '無差異' : `差距 ${diff.toFixed(1)}${unitText}`,
      bestTimeText: `${siteWithRole(best)}：${getShortDateText(best)}`,
      worstTimeText: `${siteWithRole(worst)}：${getShortDateText(worst)}`,
    }
  }).filter(Boolean)

  if (!cards.length) {
    return {
      kind: 'empty-metrics',
      title,
      ranking,
      cards: [],
    }
  }

  return {
    kind: 'ok',
    title,
    ranking,
    cards,
  }
}

/** Default slot when picking a site */
export function buildSelectedSiteFromAssessments(code, data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { code, timeMode: 'range', start: '', end: '', selectedDates: [] }
  }

  const dates = data
    .map((d) => new Date(d.Date))
    .filter((d) => Number.isFinite(d.getTime()))
    .sort((a, b) => a - b)

  return {
    code,
    timeMode: 'range',
    start: formatDateForCompare(dates[0]),
    end: formatDateForCompare(dates[dates.length - 1]),
    selectedDates: [],
  }
}
