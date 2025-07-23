<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'
import { useGroupStore } from '@/stores/group'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()
const groupStore = useGroupStore()

const group = ref('')
const description = ref('')
const ingredients = ref([{ name: '', quantity: '' }])
const steps = ref([''])
const allergenFilter = ref(false)
const userFeed = ref([])
const recommendedGroups = ref([])

async function handlePost() {
  // Basic validation (optional)
  if (!group.value.trim() || !description.value.trim() || ingredients.value.length === 0) {
    alert('Please fill in all fields')
    return
  }

  // Call createPost from postStore, including quantities
  await postStore.createPost({
    group: group.value,
    description: description.value,
    ingredients: ingredients.value,
    steps: steps.value
  })

  group.value = ''
  description.value = ''
  ingredients.value = [{ name: '', quantity: '' }]
  steps.value = ['']

  // Refresh the feed
  userFeed.value = await postStore.fetchUserFeed(userStore.currentUser.id)
}

function formatTimestamp(ts) {
  if (!ts) return ''
  // If Firestore Timestamp object
  if (ts.seconds) {
    const date = new Date(ts.seconds * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
           (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
  }
  // If string or Date
  const date = new Date(ts)
  if (isNaN(date)) return ts
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
         (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
}

onMounted(async () => {
  userFeed.value = await postStore.fetchUserFeed(userStore.currentUser.id)

  if (userStore.currentUser?.id) {
    recommendedGroups.value = await groupStore.getRecommendedGroups(userStore.currentUser.id)
  }
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await userStore.initUser(newId)
    userFeed.value = await postStore.fetchUserFeed(newId)
  }
})

function addIngredient() {
  ingredients.value.push({ name: '', quantity: '' })
}
function removeIngredient(index) {
  if (ingredients.value.length > 1) ingredients.value.splice(index, 1)
}
function addStep() {
  steps.value.push('')
}
function removeStep(index) {
  if (steps.value.length > 1) steps.value.splice(index, 1)
}

function handleLogout() {
  userStore.logout()
  postStore.allergyFilterEnabled = false
  router.push('/account')
}
</script>

<template>
  <div v-if="userStore.currentUser" class="layout">
    <!-- Profile Sidebar -->
    <aside class="sidebar">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-email">{{ userStore.currentUser.email }}</div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <span class="stat-number">{{ userStore.currentUser.posts?.length || 0 }}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ userStore.currentUser.following?.length || 0 }}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="btn btn-primary" @click="handleLogout">Logout</button>
          <button class="btn btn-outline" @click="$router.push('/account/allergen')">
            Change Allergy
          </button>
          <button 
            @click="async () => {
              postStore.toggleAllergyFilter()
              userFeed.value = await postStore.fetchUserFeed(userStore.currentUser.id)
            }" 
            class="btn btn-outline"
          >
            {{ postStore.allergyFilterEnabled ? 'Show All Posts' : 'Hide Allergens' }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Create Post Form -->
      <div class="create-post-card">
        <h2 class="card-title">Share a Recipe</h2>
        
        <div class="form-group">
          <input 
            v-model="group" 
            placeholder="Recipe Name" 
            class="input input-large"
          />
        </div>
        
        <div class="form-group">
          <textarea 
            v-model="description" 
            placeholder="Describe your recipe..."
            class="textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- Ingredients Section -->
        <div class="form-section">
          <h3 class="section-title">Ingredients</h3>
          <div class="ingredient-list">
            <div v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
              <input
                v-model="ing.name"
                placeholder="Ingredient name"
                class="input"
              />
              <input
                v-model="ing.quantity"
                placeholder="Quantity"
                class="input ingredient-qty"
              />
              <button 
                @click="removeIngredient(idx)" 
                v-if="ingredients.length > 1"
                class="btn btn-danger btn-small"
              >
                ×
              </button>
            </div>
          </div>
          <button @click="addIngredient" class="btn btn-outline btn-small">
            + Add Ingredient
          </button>
        </div>

        <!-- Steps Section -->
        <div class="form-section">
          <h3 class="section-title">Instructions</h3>
          <div class="steps-list">
            <div v-for="(step, idx) in steps" :key="idx" class="step-row">
              <span class="step-number">{{ idx + 1 }}.</span>
              <input
                v-model="steps[idx]" 
                placeholder="Describe this step..."
                class="textarea flex-1"
                rows="2"
              />
              <button 
                @click="removeStep(idx)" 
                v-if="steps.length > 1"
                class="btn btn-danger btn-small"
              >
                ×
              </button>
            </div>
          </div>
          <button @click="addStep" class="btn btn-outline btn-small">
            + Add Step
          </button>
        </div>

        <button @click="handlePost" class="btn btn-primary btn-large">
          Share Recipe
        </button>
      </div>

      <!-- Posts Feed -->
      <div class="posts-feed">
        <div v-if="postStore.loading" class="loading-message">
          Loading posts...
        </div>
        <div v-else-if="userFeed.length === 0" class="empty-message">
          No posts to show
        </div>
        <article v-for="post in userFeed" :key="post.id" class="post-card">
          <header class="post-header">
            <div class="post-author">{{ post.email }}</div>
            <time class="post-time">{{ formatTimestamp(post.timestamp) }}</time>
          </header>
          
          <h3 class="post-title">{{ post.group }}</h3>
          <p class="post-description">{{ post.description }}</p>
          
          <div class="post-ingredients">
            <h4 class="post-section-title">Ingredients</h4>
            <ul class="ingredients-list">
              <li v-for="(ing, idx) in post.ingredients" :key="ing.ingredientId || ing.name">
                <span class="ingredient-name">{{ ing.name }}</span>
                <span class="ingredient-quantity">{{ ing.quantity }}</span>
              </li>
            </ul>
          </div>
          
          <div class="post-steps">
            <h4 class="post-section-title">Instructions</h4>
            <ol class="steps-list">
              <li v-for="(step, i) in post.steps" :key="i">{{ step }}</li>
            </ol>
          </div>
        </article>
      </div>
    </main>

    <!-- Recommended Groups Sidebar -->
    <aside class="recommendations">
      <div class="recommendations-card">
        <h3 class="card-title">Recommended Groups</h3>
        <div class="recommendations-list">
          <div v-for="group in recommendedGroups" :key="group.id" class="recommendation-item">
            <div @click="$router.push(`/user/${group.id}`)" class="recommendation-name">
              {{ group.name }}
            </div>
          </div>
          <div v-if="recommendedGroups.length === 0" class="empty-recommendations">
            No more groups to recommend.
          </div>
        </div>
      </div>
    </aside>
  </div>
  
  <div v-else class="loading-screen">
    <div class="loading-spinner"></div>
    <p>Loading profile...</p>
  </div>
</template>

<style scoped>
/* Layout */
.layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc;
}

/* Sidebar Styles */
.sidebar {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.profile-header {
  text-align: center;
  margin-bottom: 24px;
}

.profile-email {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.stat {
  background: #667eea;
  color: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.create-post-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.ingredient-list,
.steps-list {
  margin-bottom: 12px;
}

.ingredient-row,
.step-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.step-number {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 8px;
}

.ingredient-qty {
  min-width: 120px;
}

/* Posts Feed */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 8px;
}

.posts-feed::-webkit-scrollbar {
  width: 6px;
}

.posts-feed::-webkit-scrollbar-track {
  background: transparent;
}

.posts-feed::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.post-author {
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: color 0.2s;
}

.post-author:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.post-time {
  font-size: 14px;
  color: #6b7280;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.post-description {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 20px;
}

.post-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.post-ingredients {
  margin-bottom: 20px;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-name {
  color: #374151;
}

.ingredient-quantity {
  color: #6b7280;
  font-weight: 500;
}

.steps-list {
  counter-reset: step-counter;
  padding-left: 0;
}

.steps-list li {
  counter-increment: step-counter;
  position: relative;
  padding-left: 40px;
  margin-bottom: 12px;
  line-height: 1.6;
  color: #374151;
}

.steps-list li::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* Recommendations */
.recommendations {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.recommendations-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  transition: background-color 0.2s;
}

.recommendation-item:hover {
  background: #f3f4f6;
}

.recommendation-name {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

/* Form Elements */
.input,
.textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-large {
  font-size: 18px;
  font-weight: 600;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.flex-1 {
  flex: 1;
}

/* Buttons */
.btn {
  padding: 12px 24px;
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
  min-height: 48px;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 56px;
}

/* Loading States */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-message,
.empty-message,
.empty-recommendations {
  text-align: center;
  color: #6b7280;
  font-size: 16px;
  padding: 40px 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .sidebar,
  .recommendations {
    position: static;
  }
}

@media (max-width: 768px) {
  .layout {
    padding: 16px;
    gap: 16px;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .ingredient-row,
  .step-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .ingredient-qty {
    min-width: auto;
  }
  
  .posts-feed {
    max-height: none;
  }
}
</style>