<template>
  <aside class="sidebar">

    <div class="sidebar-header">
      <span class="logo">🖥️</span>
      <span class="brand">GLPI NewApp</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        <span class="icon">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </router-link>

      <!-- Déconnexion en bas -->
      <router-link
        to="/deconnexion"
        class="nav-item logout-item"
      >
        <span class="icon">🚪</span>
        <span class="label">Déconnexion</span>
      </router-link>
    </nav>

  </aside>
</template>

<script setup>
// Liste centralisée du menu (facile à modifier)
const menuItems = [
  { path: '/home',                 icon: '🏠', label: 'Accueil',             exact: true  },
  { path: '/computers',        icon: '💻', label: 'Ordinateurs (GLPI)',  exact: false },
  { path: '/local-computers',  icon: '🗂️', label: 'Mes PC locaux',       exact: false },
  { path: '/reset',            icon: '🗑️', label: 'Réinitialisation',    exact: false },
  { path: '/import', icon: '📥', label: 'Import CSV', exact: false },
]
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.logout-item {
  margin-top: auto;
}
.logo {
  font-size: 26px;
}
.brand {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: #d1d5db;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.15s;
}
.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.nav-item.active {
  background: #0078d4;
  color: #fff;
  font-weight: 600;
}
.nav-item .icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 11px;
  color: #6b7280;
}
</style>