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
  <div class="flex-box">
    <!-- Profile -->
    <div class="profile">
      <div class="profile-card">
        <p class="profile-email">{{ props.user.email }}</p>
        <div class="stats">
          <div class="stat">
            <strong>{{ props.user.posts?.length || 0 }}</strong><div>Posts</div>
          </div>
          <div class="stat">
            <strong>{{ props.user.followers?.length || 0 }}</strong><div>Followers</div>
          </div>
          <div class="stat">
            <strong>{{ props.user.following?.length || 0 }}</strong><div>Following</div>
          </div>
        </div>

        <RouterLink v-if="userStore.currentUser" :to="isOwnProfile ? '/login' : '/user'" @click="isOwnProfile ? userStore.logout() : null" class="profile-btn">
          {{ isOwnProfile ? 'Logout' : 'Back to Profile' }}
        </RouterLink>
        <RouterLink v-else to="/login" class="login-btn">Login</RouterLink>
      </div>
    </div>

    <!-- Posts -->
    <div class="content-section">
      <div v-if="isOwnProfile" class="create-post">
        <textarea v-model="content" placeholder="What's on your mind?" class="post-input" />
        <button @click="handlePost" class="post-btn">Post</button>
      </div>

      <div class="posts-feed">
        <div v-if="postStore.loading">Loading posts...</div>

        <div v-for="post in postStore.posts" :key="post.id" class="post-card">
          <div class="post-header">
            <p class="post-author" @click="$router.push(`/user/${post.userId}`)">{{ post.email }}</p>
            <div class="post-time">{{ post.date }} • {{ post.time }}</div>
          </div>
          <div class="post-content">{{ post.content }}</div>
        </div>

        <p v-if="postStore.posts.length === 0">No posts to show</p>
      </div>
    </div>

    <!-- Who to follow -->
    <div class="who-to-follow" v-if="isOwnProfile">
      <h3>Who to Follow</h3>
      <div v-for="user in recommended" :key="user.id" class="follow-card">
        <p @click="$router.push(`/user/${user.id}`)" class="follow-user">{{ user.email }}</p>
        <button @click="userStore.followUser(user.id)">Follow</button>
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

.profile-email {
  font-size: large;
  color: black;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  flex: 1;
  margin: 0 5px;
  text-align: center;
}

.stat strong {
  display: block;
  font-size: x-large;
  color: rgb(0, 151, 189);
}

.stat div {
  font-size: medium;
  color: gray;
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

.create-post {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.post-input {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  resize: vertical;
}

.post-btn {
  background-color: rgb(0, 151, 189);
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

.follow-card button {
  background-color: rgb(0, 151, 189);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: medium;
  cursor: pointer;
  margin: auto 0;
}
</style>