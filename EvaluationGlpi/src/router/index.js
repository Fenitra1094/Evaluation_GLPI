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
          path: '/deconnexion',
          name: 'deconnexion',
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
        path: '/import',
        name: 'import',
        component: () => import('@/views/ImportView.vue'),
        meta: { title: 'Import CSV', requiresAuth: true },
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
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/'
  }
  document.title = `${to.meta.title} | GLPI App`
})

export default router