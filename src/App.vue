<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.init()
})
</script>

<template>
  <Navigation />
  <RouterView />
</template>

<style scoped>

</style>
