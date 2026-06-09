import { clearToken, getToken, setToken, TOKEN_KEY } from '@/utils/authSession'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export { TOKEN_KEY }

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function syncFromCookie() {
    token.value = getToken()
  }

  function setAuth(newToken, newUser = null) {
    user.value = newUser
    if (newToken) {
      setToken(newToken)
      token.value = newToken
    } else {
      logout()
    }
  }

  function logout() {
    clearToken()
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    isAuthenticated,
    syncFromCookie,
    setAuth,
    logout,
  }
})
