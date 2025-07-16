<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'

//initialization
const userStore = useUserStore()
const postStore = usePostStore()
const recentUsers = ref([])

//fetches feed or user feed depending on what profile
onMounted(async () => {
  recentUsers.value = await userStore.fetchRecentUsers(5)
  await postStore.fetchRecentPosts(10)
})
</script>

<template>
  <div class="flex-box">
    <!-- Profile -->
    <div class="profile">
      <div class="profile-card">
        <RouterLink to="/login" class="login-btn">Login</RouterLink>
      </div>
    </div>

    <!-- Posts -->
    <div class="content-section">
      <div class="posts-feed">
        <div v-if="postStore.loading">Loading posts...</div>

        <div v-for="post in postStore.posts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="post-author" @click="$router.push(`/user/${post.userId}`)">{{ post.email }}</div>
            <div class="post-time">{{ post.date }} • {{ post.time }}</div>
          </div>
          <div class="post-content">{{ post.content }}</div>
        </div>

        <div v-if="postStore.posts.length === 0">No posts to show</div>
      </div>
    </div>

    <!-- Who to follow -->
    <div class="who-to-follow">
      <h3>Recent Users</h3>
      <div v-for="user in recentUsers" :key="user.id" class="follow-card">
        <div @click="$router.push(`/user/${user.id}`)" class="follow-user">{{ user.email }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
  padding: 10px;
}

.profile {
  width: 20%;
}

.profile-card {
  background-color: #f3f3f3;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
}

button, .profile-btn, .login-btn {
  padding: 10px 20px;
  background-color: rgb(0, 151, 189);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: x-large;
  cursor: pointer;
  display: block;
  margin-top: 10px;
  text-decoration: none;
}

.content-section {
  width: 55%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 650px;
  overflow-y: auto;
}

.posts-feed::-webkit-scrollbar {
  display: none;
}

.post-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-author {
  font-weight: bold;
  color: rgb(0, 151, 189);
  cursor: pointer;
}

.post-author:hover {
  text-decoration: underline;
}

.post-time {
  font-size: 0.8rem;
  color: gray;
}

.post-content {
  font-size: large;
  color: black;
}

.who-to-follow {
  width: 20%;
  background-color: #f3f3f3;
  border-radius: 12px;
  padding: 15px;
}

.who-to-follow h3 {
  text-align: center;
  margin-bottom: 10px;
  color: black;
}

.follow-card {
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.follow-user {
  font-size: medium;
  color: black;
  cursor: pointer;
}
</style>