<script setup>
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Homepage from '@/components/Homepage.vue'

const userStore = useUserStore()
const route = useRoute()

onMounted(() => {
  userStore.viewUserProfile(route.params.id)
})
</script>

<template>
  <Homepage :user="userStore.viewingUser" />
</template>
