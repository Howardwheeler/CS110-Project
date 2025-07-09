<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const newPost = ref('')

function handlePost() {
  if (newPost.value.trim() !== '') {
    userStore.addPost(newPost.value)
    newPost.value = ''
  }
}
</script>

<template>
  <div class="flex-box">
    <!-- Profile Section -->
    <div class="column login-box">
      <div v-if="userStore.isLoggedIn()">
        <div>@{{ userStore.viewingUser.id }}</div>
        <div class="stats-box">
          <div class="stat">
            <strong>{{ userStore.viewingUser.posts.length }}</strong>
            <div>Posts</div>
          </div>
          <div class="stat">
            <strong>{{ userStore.viewingUser.following }}</strong>
            <div>Following</div>
          </div>
          <div class="stat">
            <strong>{{ userStore.viewingUser.followers }}</strong>
            <div>Followers</div>
          </div>
        </div>
        <RouterLink v-if="userStore.isViewingOwnProfile()" to="/login" @click="userStore.logout">
          Logout
        </RouterLink>
        <RouterLink v-else to="/" @click="userStore.viewUserProfile(userStore.currentUser.id)">
          Back to my profile
        </RouterLink>
      </div>
      <RouterLink v-else to="/login">Login</RouterLink>
    </div>

    <!-- Posts Section -->
    <div class="column posts-box">
      <div class="posts-container">
        <div v-for="(post, index) in userStore.userPosts()" :key="index" class="post">
          <div class="post-header">
            <strong @click="userStore.viewUserProfile(userStore.viewingUser.id)">
              @{{ userStore.viewingUser.id }}
            </strong>
            <span>Date: {{ post.date }} {{ post.time }}</span>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
        </div>
      </div>

      <!-- Create Post -->
      <div v-if="userStore.isLoggedIn() && userStore.isViewingOwnProfile()">
        <h3>Create a post</h3>
        <div class="post-input-row">
          <input v-model="newPost" placeholder="Type here" />
          <button @click="handlePost">Post</button>
        </div>
      </div>
    </div>

    <!-- Who to Follow -->
    <div class="column follow-box">
      <h3>Who to follow:</h3>
      <div v-if="userStore.whoToFollow().length > 0">
        <div v-for="user in userStore.whoToFollow()" :key="user.id" class="suggestion">
          <span @click="userStore.viewUserProfile(user.id)">
            @{{ user.id }}
          </span>
          <button @click="userStore.followUser(user.id)">Follow</button>
        </div>
      </div>
      <div v-else>No other users available</div>
    </div>
  </div>
</template>

<style scoped>
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.column {
  background-color: #f3f3f3;
  border-radius: 12px;
  padding: 10px;
  margin: 10px;
  font-size: large;
  color: black;
}

.login-box {
  width: 20%;
  text-align: center
}

.stats-box {
  display: flex;
  justify-content: space-around;
}

.stat {
  background-color: white;
  border-radius: 8px;
  text-align: center;
  flex: 1;
  margin: 10px 5px;
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

.posts-box {
  width: 55%;
  display: flex;
  flex-direction: column;
  min-height: 250px;
  max-height: 650px;
}

.posts-container {
  overflow-y: auto;
}

.posts-container::-webkit-scrollbar {
  display: none;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post {
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  text-align: left;
}

.post-content {
  font-size: large;
  color: black;
  margin-left: 5px;
  overflow: hidden;
}

.post-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.post-input-row input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: medium;
}

.post-input-row button {
  padding: 10px 20px;
  background-color: rgba(0, 151, 189, 1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: medium;
}

.follow-box {
  width: 20%;
  text-align: center;
}

.suggestion {
  background-color: white;
  margin: 5px 0px;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: medium;
}

.suggestion button {
  background-color: rgba(0, 151, 189, 1);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: medium;
}

a {
  color: white;
  text-decoration: none;
  background-color: rgba(0, 151, 189, 1);
  border-radius: 8px;
  display:  block;
}
</style>