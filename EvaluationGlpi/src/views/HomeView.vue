<template>
  <div class="home-view">
    <div class="welcome-card">
      <h1>👋 Bienvenue dans GLPI NewApp</h1>
      <p class="subtitle">
        Application de gestion de ressources GLPI via l'API REST.
      </p>

      <div class="quick-links">
        <router-link to="/computers" class="link-card">
          <span class="icon">💻</span>
          <h3>Ordinateurs</h3>
          <p>Voir la liste des ordinateurs enregistrés</p>
        </router-link>

        <router-link to="/reset" class="link-card">
          <span class="icon">🗑️</span>
          <h3>Réinitialisation</h3>
          <p>Purger les ressources GLPI via l'API</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.welcome-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
}

h1 {
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 8px;
}
.subtitle {
  color: #6b7280;
  font-size: 15px;
  margin-bottom: 30px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
}

.link-card {
  text-decoration: none;
  background: #f9fafb;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  text-align: center;
}
.link-card:hover {
  background: #eef2ff;
  border-color: #0078d4;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,120,212,0.15);
}
.link-card .icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}
.link-card h3 {
  color: #1a1a2e;
  font-size: 16px;
  margin-bottom: 6px;
}
.link-card p {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}
</style>