import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const viewingUser = ref(null)
  
  const demoUser = {
    id: 'hwhee004@ucr.edu',
    posts: [
      { content: 'Second post!', date: '01-01-2025', time: '10:45:09' },
      { content: 'Hello world!', date: '01-02-2025', time: '10:44:09' }
    ],
    followers: 1,
    following: 1,
    followingUsers: []
  }

  function isLoggedIn() {
    return currentUser.value !== null
  }

  function isViewingOwnProfile() {
    if (!viewingUser.value || !currentUser.value) return false
    return viewingUser.value.id === currentUser.value.id
  }

  function whoToFollow() {
    if (!currentUser.value) return [];
    if (currentUser.value.id !== demoUser.id && 
        !currentUser.value.followingUsers.includes(demoUser.id)) {
      return [demoUser];
    }
    return [];
  }

  function userPosts() {
    if (!viewingUser.value) return []
    return viewingUser.value.posts.slice(0, 10)
  }

  function login(email, password) {
    if (email === 'hwhee004@ucr.edu' && password === '1') {
      currentUser.value = demoUser
      viewingUser.value = demoUser
      return true
    }
    return false
  }

  function createTempUser(email) {
    const tempUser = {
      id: email,
      posts: [],
      followers: 1,
      following: 1,
      followingUsers: []
    }
    currentUser.value = tempUser
    viewingUser.value = tempUser
    return true
  }

  function logout() {
    currentUser.value = null
    viewingUser.value = null
  }

  function addPost(content) {
    if (!currentUser.value) return
    
    const now = new Date()
    currentUser.value.posts.unshift({
      content,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    })
  }

  function followUser(userId) {
    if (!currentUser.value) return
    if (userId === demoUser.id) {
      currentUser.value.following += 1
      demoUser.followers += 1
      currentUser.value.followingUsers.push(userId)
    }
  }

  function viewUserProfile(userId) {
    if (userId === demoUser.id) {
      viewingUser.value = demoUser
    } else if (currentUser.value && userId === currentUser.value.id) {
      viewingUser.value = currentUser.value
    }
  }

  return {
    currentUser,
    viewingUser,
    isLoggedIn,
    isViewingOwnProfile,
    userPosts,
    whoToFollow,
    login,
    createTempUser,
    logout,
    addPost,
    followUser,
    viewUserProfile
  }
})