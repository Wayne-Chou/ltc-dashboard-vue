import { ApiError, buildApiUrl, request } from './client'
import { getToken, validateSession } from '@/utils/authSession'

/**
 * POST /dashboard/logout
 */
export async function logoutApi(token = getToken()) {
  if (!token) return

  try {
    await fetch(buildApiUrl('/dashboard/logout'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error('[Auth] logout failed:', err)
  }
}

/**
 * POST /dashboard/login
 */
export async function login(account, password) {
  try {
    const result = await request('/dashboard/login', {
      method: 'POST',
      body: { account, password },
    })
    return { ok: true, token: result?.Data ?? null }
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, status: error.status }
    }
    return { ok: false, status: 0, networkError: true }
  }
}

export async function validateToken(token = getToken()) {
  return validateSession(token)
}
