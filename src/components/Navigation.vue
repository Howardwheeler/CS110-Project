<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()

const homeRoute = computed(() => {
  return userStore.currentUser ? '/user' : '/'
})

const accountRoute = computed(() => {
  return userStore.currentUser ? '/logout' : '/login'
})
</script>

<template>
  <header class="nav-box">
    <RouterLink :to="homeRoute">Home</RouterLink>
    <RouterLink :to="accountRoute">Login</RouterLink>
  </header>
</template>

<style>
.nav-box {
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

header {
  width: max-content;
  margin-bottom: 20px;
}

header > a {
  font-size: 30px;
  margin: 40px;
}
</style>