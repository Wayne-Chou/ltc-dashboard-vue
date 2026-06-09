
export function formatDashboardDate(timestamp) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}/${month}/${day}`
}

export function computeRiskStats(selectedAssessments = []) {
  let totalCount = 0
  let countA = 0
  let countB = 0
  let countC = 0
  let countD = 0
  let gaitSpeedDeclineCount = 0
  let chairSecondIncreaseCount = 0
  let alertGaitSpeed = 0
  let alertChairSecond = 0
  let alertA = 0
  let alertB = 0
  let alertC = 0

  selectedAssessments.forEach((item) => {
    totalCount += item.Count || 0
    const vivifrail = item.VIVIFRAIL || {}
    countA += vivifrail.A?.length || 0
    countB += vivifrail.B?.length || 0
    countC += vivifrail.C?.length || 0
    countD += vivifrail.D?.length || 0

    const degenerate = item.Degenerate || {}
    const gaitLen = Array.isArray(degenerate.GaitSpeed) ? degenerate.GaitSpeed.length : 0
    const chairLen = Array.isArray(degenerate.ChairSecond) ? degenerate.ChairSecond.length : 0

    gaitSpeedDeclineCount += gaitLen
    chairSecondIncreaseCount += chairLen
    alertGaitSpeed += gaitLen
    alertChairSecond += chairLen
    alertA += vivifrail.A?.length || 0
    alertB += vivifrail.B?.length || 0
    alertC += vivifrail.C?.length || 0
  })

  const width = (count) => (totalCount ? `${(count / totalCount) * 100}%` : '0%')

  return {
    totalCount,
    countA,
    countB,
    countC,
    countD,
    gaitSpeedDeclineCount,
    chairSecondIncreaseCount,
    alertGaitSpeed,
    alertChairSecond,
    alertA,
    alertB,
    alertC,
    progressA: width(countA),
    progressB: width(countB),
    progressC: width(countC),
    progressD: width(countD),
    progressGaitSpeed: width(gaitSpeedDeclineCount),
    progressChair: width(chairSecondIncreaseCount),
  }
}

export function computeOverviewSummary(siteStatsMap, sites = []) {
  let totalPeople = 0
  let totalTimes = 0

  Object.values(siteStatsMap).forEach((stats) => {
    totalPeople += stats.Count || 0
    totalTimes += stats.Times || 0
  })

  return {
    totalCount: totalPeople,
    latestCount: totalTimes,
    startDateText: null,
    latestDateText: null,
    locationCount: sites.length,
    locationList: sites.map((site) => site.Name).filter(Boolean).join('、'),
  }
}

export function computeSelectionSummary(selectedAssessments, t) {
  if (!selectedAssessments?.length) {
    return {
      totalCount: 0,
      latestCount: 0,
      startDateText: t('dashboard.countWarning'),
      latestDateText: t('dashboard.alertNoData'),
    }
  }

  const allNames = new Set()
  selectedAssessments.forEach((item) => {
    if (item.VIVIFRAIL) {
      Object.values(item.VIVIFRAIL).forEach((group) => {
        group.forEach((person) => {
          if (person.Name) allNames.add(person.Name)
        })
      })
    }
  })

  const totalVisits = selectedAssessments.reduce((sum, item) => sum + (item.Count || 0), 0)
  const sorted = [...selectedAssessments].sort((a, b) => a.Date - b.Date)
  const oldest = formatDashboardDate(sorted[0].Date)
  const latest = formatDashboardDate(sorted[sorted.length - 1].Date)

  const startDateText = t('dashboard.startDateText', {
    yearMonth: sorted.length === 1 ? latest : `${oldest} ~ ${latest}`,
  })

  const latestDateText = t('dashboard.latestDateText', {
    date: sorted.length === 1 ? latest : `${oldest} ~ ${latest}`,
  })

  return {
    totalCount: allNames.size,
    latestCount: totalVisits,
    startDateText,
    latestDateText,
  }
}

export function buildLocationMapFromSites(sites) {
  const locationMap = {}
  const siteStatsMap = {}

  sites.forEach((site) => {
    locationMap[site.Code] = {
      name: site.Name,
      code: site.Code,
      lat: parseFloat(site.LatLngCoordinate?.Latitude) || 25.038,
      lng: parseFloat(site.LatLngCoordinate?.Longitude) || 121.564,
      Count: site.Count || 0,
      Times: site.Times || 0,
    }
    siteStatsMap[site.Code] = {
      Count: site.Count || 0,
      Times: site.Times || 0,
    }
  })

  return { locationMap, siteStatsMap }
}
