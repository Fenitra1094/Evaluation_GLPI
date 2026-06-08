<template>
  <div class="front-layout">

    <!-- ===== TOPBAR ===== -->
    <header class="topbar">
      <div class="topbar-content">

        <!-- Logo -->
        <div class="logo">
          <span class="logo-icon">📦</span>
          <span class="logo-text">GLPI Manager</span>
        </div>

        <!-- Menu -->
        <nav class="nav-menu">
          <router-link to="/" class="nav-link">
            🏠 Éléments
          </router-link>
        </nav>

        <!-- Bouton Admin -->
        <button class="btn-admin" @click="goToAdmin">
          🔒 Back Office
        </button>

      </div>
    </header>

    <!-- ===== CONTENU ===== -->
    <main class="content">
      <router-view />
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
      <p>GLPI Manager v1.0 — Mode public</p>
    </footer>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToAdmin() {
  const isAuth = sessionStorage.getItem('isAuthenticated') === 'true'
  if (isAuth) {
    router.push('/admin/dashboard')
  } else {
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f9;
}

/* ═══════════════ TOPBAR ═══════════════ */
.topbar {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  height: 65px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

/* ═══════════════ NAV ═══════════════ */
.nav-menu {
  flex: 1;
  display: flex;
  gap: 8px;
  margin-left: 30px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

/* ═══════════════ BOUTON ADMIN ═══════════════ */
.btn-admin {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.2s;
}

.btn-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

/* ═══════════════ CONTENU ═══════════════ */
.content {
  flex: 1;
}

/* ═══════════════ FOOTER ═══════════════ */
.footer {
  background: #fff;
  padding: 15px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.footer p {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 700px) {
  .topbar-content {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 15px;
  }
  .nav-menu {
    order: 3;
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }
}
</style>