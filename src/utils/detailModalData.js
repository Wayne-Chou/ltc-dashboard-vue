import { formatPersonLine } from '@/utils/personFormat'

const VIVIFRAIL_LEVELS = ['A', 'B', 'C', 'D']
const LEVEL_HEADER_CLASS = { A: 'danger', B: 'warning', C: 'primary', D: 'success' }

function getLevelTitle(level, t) {
  if (level === 'D') return t('dashboard.levelDFull')
  return t(`dashboard.vivifrail${level}`)
}

export function collectDegenerateLists(assessments, t) {
  const gaitNames = []
  const chairNames = []

  assessments.forEach((item) => {
    if (!item?.Degenerate) return

    if (Array.isArray(item.Degenerate.GaitSpeed)) {
      item.Degenerate.GaitSpeed.forEach((person) => {
        gaitNames.push(formatPersonLine(person, t))
      })
    }

    if (Array.isArray(item.Degenerate.ChairSecond)) {
      item.Degenerate.ChairSecond.forEach((person) => {
        chairNames.push(formatPersonLine(person, t))
      })
    }
  })

  return {
    gaitNames,
    chairNames,
    totalGait: gaitNames.length,
    totalChair: chairNames.length,
  }
}

export function getAssessmentYears(assessments) {
  return [
    ...new Set(
      assessments
        .map((item) => (item?.Date ? new Date(item.Date).getFullYear() : null))
        .filter((year) => year != null),
    ),
  ].sort((a, b) => b - a)
}

export function getMonthsWithData(assessments, year) {
  const months = new Set()
  assessments.forEach((item) => {
    if (!item?.Date) return
    const date = new Date(item.Date)
    if (date.getFullYear() === year) {
      months.add(date.getMonth() + 1)
    }
  })
  return months
}

function collectLevelNames(assessments, level, t) {
  const names = []
  assessments.forEach((item) => {
    item?.VIVIFRAIL?.[level]?.forEach((person) => {
      names.push(formatPersonLine(person, t))
    })
  })
  return names
}

export function buildAllLevelsGroups(assessments, year, t) {
  const yearItems = assessments.filter((item) => {
    if (!item?.Date) return false
    return new Date(item.Date).getFullYear() === year
  })

  return VIVIFRAIL_LEVELS.map((level) => ({
    level,
    title: getLevelTitle(level, t),
    headerClass: LEVEL_HEADER_CLASS[level],
    names: collectLevelNames(yearItems, level, t),
  }))
}

export function buildMonthDateGroups(assessments, year, month, t) {
  const items = assessments.filter((item) => {
    if (!item?.Date) return false
    const date = new Date(item.Date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })

  return items.map((dateItem) => {
    const dateLabel = new Date(dateItem.Date).toLocaleDateString()
    const levels = VIVIFRAIL_LEVELS.map((level) => ({
      level,
      title: getLevelTitle(level, t),
      headerClass: LEVEL_HEADER_CLASS[level],
      names: (dateItem.VIVIFRAIL?.[level] || []).map((person) => formatPersonLine(person, t)),
    }))
    return { dateLabel, levels }
  })
}

export const MONTH_NAMES_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
