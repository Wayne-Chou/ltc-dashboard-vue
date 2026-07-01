import { request } from './client'

export function getPersonTimeRange() {
  return {
    startTime: new Date('2024-01-01').getTime(),
    endTime: Date.now(),
  }
}

/**
 * POST /dashboard/site/person
 * @returns {Promise<{ Profile: object, Datas: Array }|null>}
 */
export async function fetchPersonDetail(code, no) {
  const { startTime, endTime } = getPersonTimeRange()

  const result = await request('/dashboard/site/person', {
    method: 'POST',
    body: {
      code: String(code),
      no: Number(no),
      startdate: startTime,
      enddate: endTime,
    },
  })

  return result?.Data ?? null
}
