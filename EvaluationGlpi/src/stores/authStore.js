// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {

  // ✅ Le code mis en dur ici
  const ACCESS_CODE = '123456'

  const isAuthenticated = ref(
    sessionStorage.getItem('isAuthenticated') === 'true'
  )

  function login(codeEntre) {
    if (codeEntre === ACCESS_CODE) {
      isAuthenticated.value = true
      sessionStorage.setItem('isAuthenticated', 'true')
      return true
    }
    return false
  }

  function logout() {
    isAuthenticated.value = false
    sessionStorage.removeItem('isAuthenticated')
  }

  return {
    isAuthenticated,
    login,
    logout,
  }
})