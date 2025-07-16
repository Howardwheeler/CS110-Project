<script setup>
import { useUserStore } from '@/stores/user'
import Guestpage from '@/components/Guestpage.vue'

const userStore = useUserStore()
</script>

<template>
  <Guestpage />
</template>
