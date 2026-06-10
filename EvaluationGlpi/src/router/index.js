import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ═══════════════════════════════════════════
    // FRONT OFFICE (PUBLIC) — Layout avec topbar
    // ═══════════════════════════════════════════

     {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        {
          path: '',
          name: 'items',
          component: () => import('@/views/FrontOffice/ItemsView.vue'),
          meta: { title: 'Éléments' },
        },
        {
          path: 'createTicket',
          name: 'createTicket',
          component: () => import('@/views/FrontOffice/TicketCreateView.vue'),
          meta: { title: 'Creer Ticket' },
        },
      ]
    },
    

    
    // ═══════════════════════════════════════════
    // LOGIN ADMIN (page seule, pas de layout)
    // ═══════════════════════════════════════════

    {
      path: '/admin/login',
      name: 'admin-login',
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
      path: '/admin',
      name: 'admin',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'tickets',
          name: 'tickets',
          component: () => import('@/views/TicketsView.vue'),
          meta: { title: 'Tickets', requiresAuth: true },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: 'Tableau de bord', requiresAuth: true  },
        },
        {
          path: 'csv-import',
          name: 'csv-import',
          component: () => import('@/views/GlobalImportView.vue'),
          meta: { title: 'Import CSV', requiresAuth: true },
        },
        {
          path: 'computers',
          name: 'computers',
          component: () => import('@/views/ComputersView.vue'),
          meta: { title: 'Liste des Ordinateurs',requiresAuth: true  },
        },
        {
          path: 'reset',
          name: 'reset',
          component: () => import('@/views/ResetView.vue'),
          meta: { title: 'Réinitialisation', requiresAuth: true  },
        },
        {
          path: 'local-computers',
          name: 'local-computers',
          component: () => import('@/views/LocalComputersView.vue'),
          meta: { title: 'Mes ordinateurs locaux', requiresAuth: true  },
        },
      ]
    },

    // ═══════════════════════════════════════════
    // CATCH ALL — Redirection
    // ═══════════════════════════════════════════
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})


// ═══════════════════════════════════════════════
// 🔒 GUARD DE PROTECTION
// ═══════════════════════════════════════════════
router.beforeEach((to, from, next) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

  // Mise à jour du titre
  document.title = `${to.meta.title || 'GLPI'} | App`

  // ✅ Si la route nécessite une auth ET pas connecté
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn('🚫 Accès refusé, redirection vers login')
    return next('/admin/login')
  }

  // ✅ Si déjà connecté et qu'on va sur le login
  if (to.path === '/admin/login' && isAuthenticated) {
    return next('/admin/dashboard')
  }

  next()
})

export default router