<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const auth = getAuth()
const db = getFirestore()
const router = useRouter()

const activeTab = ref('login')
const email = ref('')
const password = ref('')
const loading = ref(false)

function switchTab(tab) {
  activeTab.value = tab
}

async function handleSubmit() {
  if (!email.value || !password.value) {
    alert('Please enter both email and password')
    return
  }

  loading.value = true

  try {
    if (activeTab.value === 'login') {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user
      router.push('/')
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        followers: [],
        following: [],
        posts: 0
      }, { merge: true })

      router.push('/')
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="box">

    <!--login vs signup-->
    <div class="tabs">
      <div class="tab" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">
        Login
      </div>
      <div class="tab" :class="{ active: activeTab === 'signup' }" @click="switchTab('signup')">
        Sign Up
      </div>
    </div>

    <!--fill in-->
    <div class="form">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="handleSubmit">
        {{ activeTab === 'login' ? 'Sign In' : 'Create' }}
      </button>
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
}
</style>
