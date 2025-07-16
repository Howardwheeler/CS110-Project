import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { auth, firestore } from '@/firebaseResources'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const viewingUser = ref(null)
  const userPosts = ref([])
  const feedPosts = ref([])
  const loading = ref(false)

  async function init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid))
        if (userDoc.exists()) {
          currentUser.value = {
            id: user.uid,
            email: user.email,
            ...userDoc.data()
          }
          viewingUser.value = currentUser.value
        } else {
          currentUser.value = {
            id: user.uid,
            email: user.email,
            feed: [],
            followers: [],
            following: [],
            posts: []
          }
        }
      } else {
        currentUser.value = null
        viewingUser.value = null
      }
    })
  }

  async function logout() {
    await signOut(auth)
    currentUser.value = null
    viewingUser.value = null
    userPosts.value = []
    feedPosts.value = []
  }

  function isViewingOwnProfile() {
    return viewingUser.value?.id === currentUser.value?.id
  }

  async function fetchUserPosts(userId) {
    loading.value = true
    try {
      const q = query(
        collection(firestore, 'posts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      userPosts.value = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }))
    } catch (error) {
      console.error('Error fetching user posts:', error)
      userPosts.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchFeedPosts() {
    if (!currentUser.value) return
    
    loading.value = true
    try {
      const following = currentUser.value.following || []
      const userIds = [currentUser.value.id, ...following].slice(0, 10)
      
      const q = query(
        collection(firestore, 'posts'),
        where('userId', 'in', userIds),
        orderBy('timestamp', 'desc'),
        limit(20)
      )
      const querySnapshot = await getDocs(q)
      feedPosts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching feed:', error)
      feedPosts.value = []
    } finally {
      loading.value = false
    }
  }

  async function viewUserProfile(userId) {
    if (userId === currentUser.value?.id) {
      viewingUser.value = currentUser.value
      await fetchFeedPosts()
    } else {
      const userDoc = await getDoc(doc(firestore, 'users', userId))
      if (userDoc.exists()) {
        viewingUser.value = {
          id: userId,
          email: userDoc.data().email,
          ...userDoc.data()
        }
        await fetchUserPosts(userId)
      }
    }
  }

  async function followUser(targetId) {
    if (!currentUser.value) return

    const userDocRef = doc(firestore, 'users', currentUser.value.id)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const updatedFollowing = [...userDoc.data().following, targetId]
      await setDoc(userDocRef, { ...userDoc.data(), following: updatedFollowing })
      currentUser.value.following = updatedFollowing
    }
  }

  async function fetchRecommendedFollows() {
    const usersSnapshot = await getDocs(collection(firestore, 'users'))
    return usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.id !== currentUser.value.id && !currentUser.value.following.includes(u.id))
  }

  return {
    currentUser,
    viewingUser,
    userPosts,
    feedPosts,
    loading,
    init,
    logout,
    isViewingOwnProfile,
    fetchUserPosts,
    fetchFeedPosts,
    viewUserProfile,
    followUser,
    fetchRecommendedFollows,
  }
})