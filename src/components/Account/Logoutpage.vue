<script setup>
import { useUserStore } from '@/stores/user'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()
</script>

<template>
  <div class="box">
    <div class="form">
      <div class="email">
        {{ userStore.currentUser.id }}
      </div>
      <RouterLink to="/login" @click="userStore.logout">Logout</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.box {
    width: 25%;
    aspect-ratio: 1 / 1;
    background-color: #f3f3f3;
    border-radius: 15%;
    margin: 10% auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
}

.email {
    font-size: xx-large;
    font-weight: bold;
    color: gray;
}

a {
    padding: 10px 100%;
    border: none;
    background-color: rgb(0, 151, 189);
    color: white;
    border-radius: 20px;
    font-size: xx-large;
    text-align: center;
}
</style>
