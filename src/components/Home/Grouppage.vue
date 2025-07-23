<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'
import { useGroupStore } from '@/stores/group'

const route = useRoute()
const userStore = useUserStore()
const postStore = usePostStore()
const groupStore = useGroupStore()

const groupFeed = ref([])
const allergenFilter = ref(false)

const recommendedGroups = computed(() => {
  if (!groupStore.groups.length || !groupStore.currentGroup) return []
  const following = userStore.currentUser?.following || []
  return groupStore.groups
    .filter(
      group =>
        group.id !== groupStore.currentGroup.id &&
        !following.includes(group.id)
    )
    .slice(0, 5)
})

const isFollowing = computed(() => {
  return userStore.currentUser && 
         userStore.currentUser.following && 
         userStore.currentUser.following.includes(groupStore.currentGroup?.id)
})

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

async function handleFollow() {
  if (userStore.currentUser && groupStore.currentGroup) {
    await userStore.followGroup(groupStore.currentGroup.id)
  }
}

onMounted(async () => {
  await groupStore.initGroup(route.params.id)
  await groupStore.fetchGroups()
  groupFeed.value = await postStore.fetchGroupFeed(groupStore.currentGroup.id)
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await groupStore.initGroup(newId)
    groupFeed.value = await postStore.fetchGroupFeed(newId)
  }
})
</script>

<template>
  <div v-if="groupStore.currentGroup" class="layout">
    <!-- Group Info Sidebar -->
    <aside class="sidebar">
      <div class="group-card">
        <div class="group-header">
          <h2 class="group-name">{{ groupStore.currentGroup?.name }}</h2>
        </div>
        
        <div class="stats">
          <div class="stat">
            <span class="stat-number">{{ groupStore.currentGroup?.feed?.length || 0 }}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat follow-stat">
            <div class="follow-status">
              <span v-if="isFollowing" class="following-badge">Following</span>
              <button 
                v-else-if="userStore.currentUser"
                @click="handleFollow"
                class="btn btn-primary"
              >
                Follow
              </button>
              <span v-else class="not-logged-in">Login to Follow</span>
            </div>
          </div>
        </div>
        
        <div class="group-actions">
          <RouterLink 
            v-if="userStore.currentUser" 
            to="/user" 
            class="btn btn-outline"
          >
            Back to Profile
          </RouterLink>
          <RouterLink 
            v-else 
            to="/" 
            class="btn btn-outline"
          >
            Back to Home
          </RouterLink>
        </div>

        <div v-if="userStore.currentUser" class="filter-section">
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

    <!-- Main Content - Group Feed -->
    <main class="main-content">
      <div class="feed-header">
        <h1 class="feed-title">{{ groupStore.currentGroup?.name }} Recipes</h1>
        <p class="feed-subtitle">Discover recipes shared by this group</p>
      </div>

      <div class="posts-feed">
        <div v-if="postStore.loading" class="loading-message">
        </div>
        
        <div v-else-if="groupFeed.length === 0" class="empty-message">
          <h3>No recipes yet</h3>
        </div>

        <article v-for="post in groupFeed" :key="post.id" class="post-card">
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
    <p>Loading group...</p>
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

/* Group Info Sidebar */
.sidebar {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.group-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.group-header {
  text-align: center;
  margin-bottom: 24px;
}

.group-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.follow-stat {
  background: #f9fafb;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.follow-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.following-badge {
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.not-logged-in {
  color: #6b7280;
  font-size: 12px;
  text-align: center;
}

.group-actions {
  margin-bottom: 24px;
}

.filter-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.filter-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.filter-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feed-header {
  text-align: center;
  margin-bottom: 8px;
}

.feed-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.feed-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
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

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  text-align: center;
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
  transition: color 0.2s;
}

.recommendation-name:hover {
  color: #667eea;
}

/* Button Styles */
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
  width: 100%;
}

.btn-primary {
  background: #667eea;
  color: white;
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
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

/* Loading and Empty States */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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

.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-message h3 {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-message p {
  margin: 0;
}

.empty-recommendations {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
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
  
  .feed-header {
    text-align: left;
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
  
  .feed-title {
    font-size: 24px;
  }
  
  .group-name {
    font-size: 18px;
  }
  
  .posts-feed {
    max-height: none;
  }
}
</style>