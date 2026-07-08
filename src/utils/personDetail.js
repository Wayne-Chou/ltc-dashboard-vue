
export function convertToAssessments(datas) {
  if (!datas?.length) return []

  return datas
    .filter((item) => item?.Date)
    .map((item) => {
      const assessment = {
        Date: item.Date,
        ChairSecond: item.SPPB?.Chairtest?.Second ?? null,
        BalanceScore:
          (item.SPPB?.Balancetest?.balance1?.Score ?? 0) +
          (item.SPPB?.Balancetest?.balance2?.Score ?? 0) +
          (item.SPPB?.Balancetest?.balance3?.Score ?? 0),
        GaitSpeed: item.SPPB?.Gaitspeed?.Speed ?? null,
        RiskRate: item.Risk ?? null,
      }
      assessment.status = getClinicalStatus(assessment)
      return assessment
    })
}

export function getClinicalStatus(assessment) {
  const chair = assessment.ChairSecond
  const balance = assessment.BalanceScore
  const gait = assessment.GaitSpeed
  const risk = assessment.RiskRate

  if (
    (chair != null && chair > 15) ||
    (balance != null && balance < 3) ||
    (gait != null && gait < 80) ||
    (risk != null && risk >= 30)
  ) {
    return 'critical'
  }

  if (
    (chair != null && chair > 12) ||
    (balance != null && balance < 3.5) ||
    (gait != null && gait < 100) ||
    (risk != null && risk >= 20)
  ) {
    return 'watch'
  }

  return 'good'
}

export function calculateTrend(assessments) {
  if (!assessments || assessments.length < 2) return null

  const sorted = [...assessments].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  )

  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]

  const getChange = (newVal, oldVal) => {
    if (newVal == null || oldVal == null || Number.isNaN(newVal) || Number.isNaN(oldVal)) {
      return null
    }
    if (oldVal === 0) {
      if (newVal === 0) return 0
      return newVal > 0 ? 100 : -100
    }
    return parseFloat((((newVal - oldVal) / oldVal) * 100).toFixed(2))
  }

  return {
    sitStand: getChange(last.ChairSecond, prev.ChairSecond),
    balance: getChange(last.BalanceScore, prev.BalanceScore),
    gait: getChange(last.GaitSpeed, prev.GaitSpeed),
    risk: getChange(last.RiskRate, prev.RiskRate),
    lastDate: last.Date,
    prevDate: prev.Date,
  }
}

export function pickLatestTwo(assessments) {
  const valid = (assessments || []).filter((item) => item?.Date != null)
  valid.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
  if (valid.length < 2) return null
  return [valid[valid.length - 2], valid[valid.length - 1]]
}

export function getLatestClinicalStatus(assessments) {
  const valid = (assessments || []).filter((item) => item?.Date != null)
  if (!valid.length) return 'neutral'
  valid.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
  return valid[valid.length - 1].status || 'good'
}

function pctChange(prev, curr, higherIsBetter) {
  if (prev == null || curr == null) return null
  if (prev === 0) return null
  let delta = ((curr - prev) / Math.abs(prev)) * 100
  if (higherIsBetter === false) delta = -delta
  return delta
}

export function buildHeadlineFromAssessments(assessments) {
  const pair = pickLatestTwo(assessments)
  if (!pair) {
    return {
      tone: 'neutral',
      statusKey: 'noData',
      rangeText: '--',
      titleKey: 'noData',
      descKey: 'noData',
    }
  }

  const [prev, curr] = pair
  const sit = pctChange(prev.ChairSecond, curr.ChairSecond, false)
  const bal = pctChange(prev.BalanceScore, curr.BalanceScore, true)
  const gait = pctChange(prev.GaitSpeed, curr.GaitSpeed, true)
  const risk = pctChange(prev.RiskRate, curr.RiskRate, false)

  const issues = []

  if (sit != null) {
    issues.push({
      bad: sit < -8,
      sev: Math.abs(sit),
      titleKey: sit < 0 ? 'sitStandSlow' : 'sitStandFast',
    })
  }
  if (bal != null) {
    issues.push({
      bad: bal < -8,
      sev: Math.abs(bal),
      titleKey: bal < 0 ? 'balanceDown' : 'balanceUp',
    })
  }
  if (gait != null) {
    issues.push({
      bad: gait < -8,
      sev: Math.abs(gait),
      titleKey: gait < 0 ? 'gaitDown' : 'gaitUp',
    })
  }
  if (risk != null) {
    issues.push({
      bad: risk < -15,
      sev: Math.abs(risk),
      titleKey: risk < 0 ? 'riskUp' : 'riskDown',
    })
  }

  issues.sort((a, b) => {
    if (a.bad !== b.bad) return a.bad ? -1 : 1
    return b.sev - a.sev
  })

  const top = issues[0]
  const rangeText = `${formatLocaleDate(prev.Date)} → ${formatLocaleDate(curr.Date)}`

  if (!top) {
    return {
      tone: 'neutral',
      statusKey: 'noData',
      rangeText,
      titleKey: 'noData',
      descKey: 'noData',
    }
  }

  const hasBad = issues.some((item) => item.bad)
  const riskUp = risk != null && risk < -15
  let tone = 'ok'
  let statusKey = 'ok'

  if (hasBad) {
    tone = riskUp ? 'bad' : 'warn'
    statusKey = riskUp ? 'bad' : 'warn'
  }

  return {
    tone,
    statusKey,
    rangeText,
    titleKey: top.titleKey,
    descKey: statusKey,
  }
}

export function formatLocaleDate(value) {
  if (!value) return '--'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '--'
  }
}

export function formatLocaleDateTime(value) {
  if (!value) return '--'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '--'

    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}`
  } catch {
    return '--'
  }
}

/**
 * @param {Array} selectedDatas
 * @param {Array} compareDatas - latest two records for date display
 * @param {{ empty: string, single: string, multi: string, comparing: string }} hintLang
 */
export function buildComparePanelHint(selectedDatas, compareDatas, hintLang) {
  if (!hintLang) return ''

  function format(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
  }

  const selected = selectedDatas || []
  if (!selected.length) return hintLang.empty
  if (selected.length === 1) return hintLang.single

  const dates = (compareDatas || [])
    .filter((item) => item?.Date)
    .map((item) => new Date(item.Date).toLocaleDateString())

  if (selected.length > 2) {
    return format(hintLang.multi, {
      count: String(selected.length),
      d1: dates[0] ?? '',
      d2: dates[1] ?? '',
    })
  }

  return format(hintLang.comparing, {
    d1: dates[0] ?? '',
    d2: dates[1] ?? '',
  })
}

export function getRiskColor(risk) {
  if (risk == null) return 'inherit'
  if (risk > 50) return '#dc3545'
  if (risk > 30) return '#fd7e14'
  if (risk > 17.5) return '#ffc107'
  if (risk > 5) return '#28a745'
  return '#198754'
}

export function getRiskLabelKey(risk) {
  if (risk == null) return 'unknown'
  if (risk > 50) return 'high'
  if (risk > 30) return 'slightlyHigh'
  if (risk > 17.5) return 'medium'
  if (risk > 5) return 'slightlyLow'
  return 'low'
}

export function genderText(gender, t) {
  if (gender === 1 || gender === '1') return t('personDetail.male')
  if (gender === 0 || gender === '0') return t('personDetail.female')
  return t('personDetail.unknown')
}

export function filterRecordsByDateRange(records, startDate, endDate) {
  if (!startDate && !endDate) return records

  return records.filter((record) => {
    if (!record?.Date) return false
    const date = new Date(record.Date)
    if (startDate && date < startOfDay(new Date(startDate))) return false
    if (endDate) {
      const end = endOfDay(new Date(endDate))
      if (date > end) return false
    }
    return true
  })
}

function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}
