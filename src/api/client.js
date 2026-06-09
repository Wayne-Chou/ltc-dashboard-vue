import { SessionExpiredError } from '@/api/errors'
import { handleUnauthorized } from '@/services/authService'
import { getToken } from '@/utils/authSession'

const DEFAULT_API_BASE_URL = 'https://service.fongai.co/WebAPI/api'

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  const base = configured || DEFAULT_API_BASE_URL
  return base.replace(/\/+$/, '')
}

export function buildApiUrl(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${getApiBaseUrl()}${path}`
}

export class ApiError extends Error {
  constructor(status, body) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function isLoginEndpoint(endpoint) {
  const path = endpoint.split('?')[0]
  return path === '/dashboard/login'
}

function isPersonDetailEndpoint(endpoint) {
  const path = endpoint.split('?')[0]
  return path === '/dashboard/site/person'
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export async function request(endpoint, options = {}) {
  const { headers = {}, body, ...rest } = options

  const config = {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
  }

  if (body !== undefined && body !== null) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
    config.headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildApiUrl(endpoint), config)

  if (response.status === 401 && !isLoginEndpoint(endpoint)) {
    const redirectPath =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : undefined
    handleUnauthorized(redirectPath, {
      expired: !isPersonDetailEndpoint(endpoint),
    })
    throw new SessionExpiredError()
  }

  if (!response.ok) {
    const errorBody = await parseResponse(response).catch(() => null)
    throw new ApiError(response.status, errorBody)
  }

  if (response.status === 204) {
    return null
  }

  return parseResponse(response)
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}
