const DEFAULT_API_BASE_URL = 'https://service.fongai.co/WebAPI/api'

export function getApiBaseUrl() {
 
  if (import.meta.env.DEV) {
    return '/api'
  }

 
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  const base = configured || DEFAULT_API_BASE_URL
  return base.replace(/\/+$/, '')
}

export function buildApiUrl(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${getApiBaseUrl()}${path}`
}