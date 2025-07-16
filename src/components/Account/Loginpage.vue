<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const userStore = useUserStore()
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

const activeTab = ref('login')
const email = ref('')
const password = ref('')

function switchTab(tab) {
  activeTab.value = tab
}

async function handleSubmit() {
  if (!email.value || !password.value) {
    alert('Please enter both email and password')
    return
  }

  try {
    if (activeTab.value === 'login') {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      userStore.init()
      router.push('/user')
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        followers: [],
        following: [],
        posts: 0
      }, { merge: true })
      userStore.init()
      router.push('/user')
    }
  } catch (error) {
    alert(error.message)
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="box">
    <!-- Conditional based on login -->
    <div class="form" v-if="!userStore.currentUser">
      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">Login</div>
        <div class="tab" :class="{ active: activeTab === 'signup' }" @click="switchTab('signup')">Sign Up</div>
      </div>

      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="handleSubmit">
        {{ activeTab === 'login' ? 'Sign In' : 'Create' }}
      </button>
    </div>

    <div class="form" v-else>
      <div class="tab">
        {{ userStore.currentUser.email }}
      </div>
      <button @click="handleLogout">Logout</button>
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
    flex-direction: column;
}

.tabs {
    display: flex;
    justify-content: space-around;
    margin: 35px;
    position: relative;
    cursor: pointer;
}

.tab {
    font-size: x-large;
    padding: 0.5rem;
    position: relative;
    color: gray;
  
}

.tab.active {
    font-weight: bold;
    color: black;
}

.tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 100%;
    height: 4px;
    background-color: rgb(0, 151, 189);
    border-radius: 2px;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: auto 10px;
}

input {
    padding: 10px;
    border-radius: 8px;
    font-size: x-large;
}

input::placeholder {
    color: lightgray;
}

button {
    padding: 10px;
    border: none;
    background-color: rgb(0, 151, 189);
    color: white;
    border-radius: 20px;
    font-size: xx-large;
    text-align: center;
    cursor: pointer;
}
</style>
