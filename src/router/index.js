import { createRouter, createWebHistory } from 'vue-router'
import ProfileView from '@/views/Profile.vue'
import LoginView from '@/views/Login.vue'
import AllergenView from "@/views/Allergen.vue"
import LogoutView from '@/views/Logout.vue'
import HomeView from '@/views/Home.vue'
import GuestView from '@/views/Guest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: GuestView,
    },
    {
      path: '/account',
      name: 'Account',
      component: LoginView,
    },
    {
      path: '/account/allergen',
      name: 'Allergen',
      component: AllergenView,
    },
    {
      path: '/logout',
      name: 'Logout',
      component: LogoutView,
    },
    {
      path: '/user',
      name: 'User',
      component: HomeView,
    },
    {
      path: '/user/:id',
      name: 'Profile',
      component: ProfileView,
    }
  ],
})

export default router
