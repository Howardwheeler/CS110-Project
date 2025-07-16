<script setup>
import { useUserStore } from '@/stores/user'
import Homepage from '@/components/Homepage.vue'

const userStore = useUserStore()
</script>

<template>
  <Homepage :user="userStore.currentUser" />
</template>
