<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
    <header class="nav-box">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="userStore.isLoggedIn()" to="/logout">Login</RouterLink>
        <RouterLink v-else to="/login">Login</RouterLink>
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