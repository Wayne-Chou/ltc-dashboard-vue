import { SessionExpiredError } from '@/api/errors'
import { buildApiUrl } from '@/api/url'

export const TOKEN_KEY = 'fongai_token'

const LEGACY_STORAGE_KEY = 'ltc_token'

let isRedirecting = false

export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

export function setCookie(name, value, minutes = 30) {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + minutes * 60 * 1000)
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

export function deleteCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function getToken() {
  return getCookie(TOKEN_KEY)
}

export function setToken(value, minutes = 30) {
  if (!value) {
    clearToken()
    return
  }
  setCookie(TOKEN_KEY, value, minutes)
}

export function clearToken() {
  deleteCookie(TOKEN_KEY)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }
}


export function migrateLegacyTokenStorage() {
  if (typeof localStorage === 'undefined') return
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacy) {
    setToken(legacy)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }
}

export async function validateSession(token = getToken()) {
  if (!token) return false

  try {
    const response = await fetch(buildApiUrl('/dashboard/validate'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.status === 200
  } catch {
    return false
  }
}

export function isUnauthorizedError(error) {
  return error?.name === 'SessionExpiredError'
}

export function isExpired(error) {
  return isUnauthorizedError(error)
}

/** @deprecated use isUnauthorizedError */
export const isSessionExpiredError = isUnauthorizedError

export { SessionExpiredError }

export function beginRedirectGuard() {
  if (isRedirecting) return false
  isRedirecting = true
  return true
}

export function endRedirectGuard() {
  isRedirecting = false
}

migrateLegacyTokenStorage()
