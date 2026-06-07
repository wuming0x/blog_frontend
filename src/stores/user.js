import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'blog_user'

function readStoredUser() {
  const value = localStorage.getItem(STORAGE_KEY)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref(readStoredUser())
  const isLoggedIn = computed(() => Boolean(user.value?.id))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setUser(nextUser) {
    user.value = {
      id: nextUser.id,
      username: nextUser.username,
      role: nextUser.role ?? 'USER',
      token: nextUser.token ?? null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    setUser,
    logout,
  }
})
