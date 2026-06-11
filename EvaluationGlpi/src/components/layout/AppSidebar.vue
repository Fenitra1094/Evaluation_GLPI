<template>
  <aside class="sidebar">

    <!-- HEADER -->
    <div class="sidebar-header">
      <div class="header-icon">🔒</div>
      <div>
        <strong>Back Office</strong>
        <small>Administration</small>
      </div>
    </div>

    <!-- MENU -->
    <nav class="nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- FOOTER -->
    <div class="sidebar-footer">
      <button class="btn-front" @click="$router.push('/')">
        🌐 Retour au site
      </button>
      <button class="btn-logout" @click="logout">
        🚪 Déconnexion
      </button>
    </div>

  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { path: '/admin/dashboard',  icon: '📊', label: 'Dashboard' },
  { path: '/admin/tickets',    icon: '🎫', label: 'Tickets' },
  { path: '/admin/csv-import', icon: '📥', label: 'Import CSV' },
  { path: '/admin/reset',      icon: '🗑️', label: 'Réinitialisation' },
  { path: '/admin/kanban-settings',      icon: '🎨', label: 'kanban-settings' },
  { path: '/admin/languages',      icon: '🌍', label: 'languages' },
]

function logout() {
  sessionStorage.removeItem('isAuthenticated')
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-icon {
  font-size: 28px;
  background: rgba(255,255,255,0.1);
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-header strong {
  display: block;
  font-size: 15px;
}

.sidebar-header small {
  font-size: 11px;
  opacity: 0.6;
}

.nav {
  flex: 1;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  padding: 11px 14px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
}

.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-front, .btn-logout {
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-front {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.btn-front:hover {
  background: rgba(255,255,255,0.2);
}

.btn-logout {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
}
</style>