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
      await userStore.init()
      // If user has no allergens set, go to allergen page
      if (!userStore.currentUser?.allergens || userStore.currentUser.allergens.length === 0) {
        router.push('/account/allergen')
      } else {
        router.push('/user')
      }
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        following: [],
        posts: [],
        allergens: [],
        feed: []
      }, { merge: true })
      await userStore.init()
      router.push('/account/allergen')
    }
  } catch (error) {
    alert(error.message)
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/account')
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card" v-if="!userStore.currentUser">
      <div class="auth-header">
        <h1 class="auth-title">Welcome</h1>
        <p class="auth-subtitle">Sign in to your account or create a new one</p>
      </div>

      <div class="tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'login' }" 
          @click="switchTab('login')"
        >
          Login
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'signup' }" 
          @click="switchTab('signup')"
        >
          Sign Up
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email address"
            class="auth-input"
            required
          />
        </div>
        
        <div class="input-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Password"
            class="auth-input"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary">
          {{ activeTab === 'login' ? 'Sign In' : 'Create Account' }}
        </button>
      </form>
    </div>

    <div class="auth-card user-card" v-else>
      <div class="user-info">
        <div class="user-avatar">
          {{ userStore.currentUser.email.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <h2 class="user-email">{{ userStore.currentUser.email }}</h2>
          <p class="user-status">Signed in</p>
        </div>
      </div>
      
      <button @click="handleLogout" class="btn btn-outline">
        Sign Out
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.auth-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.tabs {
  display: flex;
  background: #f9fafb;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.auth-input {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #374151;
  background: white;
  transition: all 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-input::placeholder {
  color: #9ca3af;
}

.btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* User Card Styles */
.user-card {
  text-align: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.user-details {
  text-align: center;
}

.user-email {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-status {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 24px;
  }
  
  .auth-title {
    font-size: 24px;
  }
  
  .tabs {
    flex-direction: column;
    gap: 4px;
  }
  
  .tab {
    width: 100%;
  }
}
</style>