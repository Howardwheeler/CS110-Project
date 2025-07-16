import { createRouter, createWebHistory } from 'vue-router'
import ProfileView from '@/views/Profile.vue'
import LoginView from '@/views/Login.vue'
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
      path: '/login',
      name: 'Login',
      component: LoginView,
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
