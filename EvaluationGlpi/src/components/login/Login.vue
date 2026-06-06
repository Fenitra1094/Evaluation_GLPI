<template>
  <div class="login-container">
    <div class="login-card">

      <!-- Logo / Icône -->
      <div class="login-header">
        <div class="logo">🖥️</div>
        <h1>GLPI Manager</h1>
        <p class="subtitle">Entrez votre code d'accès</p>
      </div>

      <!-- Formulaire -->
      <div class="login-form">

        <div class="input-group">
          <label for="code">Code d'accès</label>
          <div class="input-wrapper">
            <span class="input-icon">🔐</span>
            <input
              id="code"
              :type="showCode ? 'text' : 'password'"
              v-model="code"
              placeholder="Entrez votre code"
              @keyup.enter="recupererCode"
            />
            <button
              type="button"
              class="toggle-visibility"
              @click="showCode = !showCode"
            >
              {{ showCode ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Message d'erreur -->
        <p v-if="erreur" class="erreur">
          <span>⚠️</span> {{ erreur }}
        </p>

        <!-- Bouton -->
        <button class="btn-login" @click="recupererCode">
          <span>Se connecter</span>
          <span class="arrow">→</span>
        </button>

      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>GLPI NewApp v1.0</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ✅ Code pré-rempli par défaut
const code     = ref('123456')
const erreur   = ref('')
const showCode = ref(false)
const router   = useRouter()
const auth     = useAuthStore()

function recupererCode() {
  erreur.value = ''

  if (code.value.trim() === '') {
    erreur.value = 'Veuillez entrer un code'
    return
  }

  const ok = auth.login(code.value.trim())

  if (!ok) {
    erreur.value = 'Code incorrect'
    return
  }

  router.push('/home')
}
</script>

<style scoped>
/* ========================================
   CONTAINER
======================================== */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

/* ========================================
   CARD
======================================== */
.login-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

/* ========================================
   HEADER
======================================== */
.login-header {
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  padding: 40px 30px;
  text-align: center;
  color: #fff;
}

.logo {
  font-size: 50px;
  margin-bottom: 15px;
}

.login-header h1 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* ========================================
   FORM
======================================== */
.login-form {
  padding: 35px 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 50px 14px 45px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.input-wrapper input:focus {
  border-color: #0078d4;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.1);
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.toggle-visibility {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-visibility:hover {
  opacity: 1;
}

/* ========================================
   ERREUR
======================================== */
.erreur {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 20px;
}

/* ========================================
   BUTTON
======================================== */
.btn-login {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 120, 212, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login .arrow {
  transition: transform 0.3s ease;
}

.btn-login:hover .arrow {
  transform: translateX(5px);
}

/* ========================================
   FOOTER
======================================== */
.login-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 480px) {
  .login-card {
    border-radius: 15px;
  }

  .login-header {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 22px;
  }

  .login-form {
    padding: 25px 20px;
  }
}
</style>