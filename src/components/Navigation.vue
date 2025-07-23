<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()

const homeRoute = computed(() => {
  return userStore.currentUser ? '/user' : '/'
})

const accountRoute = computed(() => {
  return userStore.currentUser ? '/logout' : '/account'
})
</script>

<template>
  <header class="nav-container">
    <nav class="nav-box">
      <RouterLink :to="homeRoute" class="nav-link">Home</RouterLink>
      <RouterLink :to="accountRoute" class="nav-link">
        {{ userStore.currentUser ? 'Logout' : 'Login' }}
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.nav-container {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  margin-bottom: 0;
}

.nav-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.nav-link {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 12px;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: #ede9fe;
  color: #5b21b6;
  font-weight: 700;
}

.nav-link.router-link-active:hover {
  background: #e0e7ff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 12px 16px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 8px 12px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 8px 12px;
  }
}
</style>