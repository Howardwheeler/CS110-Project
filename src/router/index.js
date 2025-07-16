import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import ProfileView from '@/views/Profile.vue'
import LoginView from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/user'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
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
