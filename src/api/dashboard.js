import { request } from './client'

export function getTimeRange() {
  return {
    startTime: new Date('2024-01-01').getTime(),
    endTime: Date.now(),
  }
}

/**
 * GET /dashboard/sites
 * @returns {Promise<Array>}
 */
export async function fetchSites() {
  const result = await request('/dashboard/sites', { method: 'GET' })
  return result?.Data ?? []
}

/**
 * POST /dashboard/site
 * Body: { code, startdate, enddate }
 * @returns {Promise<Array>} assessments
 */
export async function fetchAssessments(code, startTime, endTime) {
  if (!code) {
    return []
  }

  const range = getTimeRange()
  const result = await request('/dashboard/site', {
    method: 'POST',
    body: {
      code,
      startdate: startTime ?? range.startTime,
      enddate: endTime ?? range.endTime,
    },
  })

  return result?.Data?.assessments ?? []
}
