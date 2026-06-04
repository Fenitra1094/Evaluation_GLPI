import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Accueil' },
    },
    {
      path: '/computers',
      name: 'computers',
      component: () => import('@/views/ComputersView.vue'),
      meta: { title: 'Liste des Ordinateurs' },
    },
    {
      path: '/reset',
      name: 'reset',
      component: () => import('@/views/ResetView.vue'),
      meta: { title: 'Réinitialisation' },
    },
  ],
})

// Mise à jour du titre de la page
router.beforeEach((to) => {
  document.title = `${to.meta.title} | GLPI App`
})

export default router