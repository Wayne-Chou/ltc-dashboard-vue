import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { clearToken, beginRedirectGuard, endRedirectGuard } from '@/utils/authSession'
import { resetGlobalLoading } from '@/utils/globalLoading'

function buildLoginQuery({ redirect, expired }) {
  const query = {}

  if (expired) {
    query.reason = 'expired'
  }

  const target = redirect || router.currentRoute.value?.fullPath
  if (target && !String(target).startsWith('/login')) {
    query.redirect = target
  }

  return query
}

function logoutAuthStore() {
  const authStore = useAuthStore()
  authStore.logout()
}

/**
 * Centralized logout + redirect flow.
 * Keeps authSession as a pure token/session utility.
 */
export async function logoutAndRedirect({ redirect, expired = false } = {}) {
  if (!beginRedirectGuard()) return

  try {
    resetGlobalLoading()
    clearToken()
    logoutAuthStore()

    const query = buildLoginQuery({ redirect, expired })
    await router.replace({ name: 'login', query })
  } finally {
    endRedirectGuard()
  }
}

export function redirectLogin(options = {}) {
  return logoutAndRedirect(options)
}

export function handleUnauthorized(redirectPath, { expired = true } = {}) {
  void logoutAndRedirect({
    redirect: redirectPath,
    expired,
  })
}
