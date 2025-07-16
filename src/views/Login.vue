<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

import Login from '@/components/Account/Loginpage.vue'
import Logout from '@/components/Account/Logoutpage.vue'

const userStore = useUserStore()

function isLoggedIn() {
  return !!userStore.currentUser
}
</script>

<template>
  <div>
    <Login v-if="!isLoggedIn()" />
    <Logout v-else />
  </div>
</template>
