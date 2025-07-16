<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'

const props = defineProps({
  user: Object
})

const userStore = useUserStore()
const postStore = usePostStore()
const content = ref('')
const recommended = ref([])

const isOwnProfile = userStore.isViewingOwnProfile()

onMounted(async () => {
  if (isOwnProfile) {
    await postStore.fetchFeed(userStore.currentUser)
    recommended.value = await userStore.fetchRecommendedFollows()
  } else {
    await postStore.fetchUserPosts(props.user.id)
  }
})

watch(() => userStore.viewingUser?.id, async () => {
  if (userStore.isViewingOwnProfile()) {
    await postStore.fetchFeed(userStore.currentUser)
  } else {
    await postStore.fetchUserPosts(props.user.id)
  }
})

async function handlePost() {
  if (!content.value.trim()) return
  await postStore.createPost(content.value)
  content.value = ''
}
</script>

<template>
  <div class="homepage-container">
    <!-- Profile -->
    <aside class="profile-section">
      <div class="profile-card">
        <p class="profile-email">{{ props.user.email }}</p>
        <div class="profile-stats">
          <div class="stat">
            <strong>{{ props.user.posts?.length || 0 }}</strong><span>Posts</span>
          </div>
          <div class="stat">
            <strong>{{ props.user.followers?.length || 0 }}</strong><span>Followers</span>
          </div>
          <div class="stat">
            <strong>{{ props.user.following?.length || 0 }}</strong><span>Following</span>
          </div>
        </div>

        <RouterLink v-if="userStore.currentUser" :to="isOwnProfile ? '/login' : '/user'" @click="isOwnProfile ? userStore.logout() : null" class="profile-btn">
          {{ isOwnProfile ? 'Logout' : 'Back to Profile' }}
        </RouterLink>
        <RouterLink v-else to="/login" class="login-btn">Login</RouterLink>
      </div>
    </aside>

    <!-- Posts -->
    <main class="content-section">
      <section v-if="isOwnProfile" class="create-post">
        <textarea v-model="content" placeholder="What's on your mind?" class="post-input" />
        <button @click="handlePost" class="post-btn">Post</button>
      </section>

      <section class="posts-feed">
        <div v-if="postStore.loading">Loading posts...</div>

        <article v-for="post in postStore.posts" :key="post.id" class="post-card">
          <div class="post-header">
            <p class="post-author" @click="$router.push(`/user/${post.userId}`)">{{ post.email }}</p>
            <span class="post-time">{{ post.date }} • {{ post.time }}</span>
          </div>
          <div class="post-content">{{ post.content }}</div>
        </article>

        <p v-if="postStore.posts.length === 0">No posts to show</p>
      </section>
    </main>

    <!-- Who to follow -->
    <aside class="who-to-follow" v-if="isOwnProfile">
      <h3>Who to Follow</h3>
      <div v-for="user in recommended" :key="user.id" class="follow-card">
        <p @click="$router.push(`/user/${user.id}`)" class="follow-user">{{ user.email }}</p>
        <button @click="userStore.followUser(user.id)">Follow</button>
      </div>
    </aside>
  </div>
</template>


<style scoped>
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.profile-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-email {
  margin: 0 0 15px;
  font-size: 1.1rem;
  color: #333;
}

.login-box {
  width: 20%;
  text-align: center;
}

.stats-box {
  display: flex;
  justify-content: space-around;
}

.stat {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.stat strong {
  display: block;
  font-size: 1.2rem;
  color: #0097bd;
}

.stat span {
  font-size: 0.8rem;
  color: #666;
}

button, .login-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.logout-btn {
  background: #ff4444;
  color: white;
}

.logout-btn:hover {
  background: #cc0000;
}

.profile-btn, .login-btn {
  background: #0097bd;
  color: white;
}

.profile-btn:hover, .login-btn:hover {
  background: #007799;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.create-post {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-input {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px 0;
  resize: vertical;
}

.post-btn {
  background: #0097bd;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.post-btn:hover {
  background: #007799;
}

.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-author {
  color: #0097bd;
  cursor: pointer;
  margin: 0;
}

.post-author:hover {
  text-decoration: underline;
}

.post-time {
  color: #666;
  font-size: 0.8rem;
}

.post-content {
  line-height: 1.5;
}

.loading, .empty-feed {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>