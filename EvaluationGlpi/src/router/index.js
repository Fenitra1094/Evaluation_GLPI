import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Code',
      component: () => import('@/views/Mdp.vue'),
      meta: { title: 'Connexion' },
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: 'home'
        },
        {
          path: '/home',
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
        {
          path: '/local-computers',
          name: 'local-computers',
          component: () => import('@/views/LocalComputersView.vue'),
          meta: { title: 'Mes ordinateurs locaux' },
        },
      ]
    },
  ],
})

// Mise à jour du titre de la page
router.beforeEach((to) => {
  document.title = `${to.meta.title} | GLPI App`
})

export default router