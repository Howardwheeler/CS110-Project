import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getDocs, setDoc, collection, query, limit } from 'firebase/firestore'
import { auth, firestore } from '@/firebaseResources'

export const useUserStore = defineStore('user', () => {
  //initial constructor
  const currentUser = ref(null)
  const viewingUser = ref(null)
  const loading = ref(false)

  //initializes a user 
  async function init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid))
        const data = userDoc.exists() ? userDoc.data() : {
          followers: [],
          following: [],
          posts: 0
        }

        const formattedUser = {
          id: user.uid,
          email: user.email,
          followers: data.followers,
          following: data.following,
          posts: data.posts
        }

        currentUser.value = formattedUser
        viewingUser.value = formattedUser
      } else {
        currentUser.value = null
        viewingUser.value = null
      }
    })
  }

  //sign out of user lol
  async function logout() {
    await signOut(auth)
    currentUser.value = null
    viewingUser.value = null
  }

  //checks if cur user os view user
  function isViewingOwnProfile() {
    return viewingUser.value?.id === currentUser.value?.id
  }

  //loads stats of another user to view
  async function viewUserProfile(userId) {
    if (userId === currentUser.value?.id) {
      viewingUser.value = currentUser.value
    } else {
      const userDoc = await getDoc(doc(firestore, 'users', userId))
      if (userDoc.exists()) {
        const data = userDoc.data()
        viewingUser.value = {
          id: userId,
          email: data.email,
          followers: data.followers,
          following: data.following,
          posts: data.posts
        }
      }
    }
  }

  //increment follower and adds to following array
  async function followUser(targetId) {
    if (!currentUser.value) return

    //Update current user's following
    const currentUserRef = doc(firestore, 'users', currentUser.value.id)
    const currentUserSnap = await getDoc(currentUserRef)

    if (currentUserSnap.exists()) {
      const currentData = currentUserSnap.data()
      const updatedFollowing = [...new Set([...currentData.following, targetId])]

      await setDoc(currentUserRef, {
        ...currentData,
        following: updatedFollowing
      })

      currentUser.value.following = updatedFollowing
    }

    //Update target user's followers
    const targetUserRef = doc(firestore, 'users', targetId)
    const targetUserSnap = await getDoc(targetUserRef)

    if (targetUserSnap.exists()) {
      const targetData = targetUserSnap.data()
      const updatedFollowers = [...new Set([...targetData.followers, currentUser.value.id])]

      await setDoc(targetUserRef, {
        ...targetData,
        followers: updatedFollowers
      })
    }
  }

  //gets who to follow by checking non-followed users in docs
  async function fetchRecommendedFollows(max = 6) {
    const q = query(collection(firestore, 'users'), limit(max))
    const usersSnapshot = await getDocs(q)
    return usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user =>
        user.id !== currentUser.value.id &&
        !currentUser.value.following.includes(user.id)
      )
  }

  //returns followed user
  function followingUser(userId) {
    return currentUser.value?.following?.includes(userId) || false
  }

  //per post, increment post count in docs
  async function incrementUserPostCount() {
    if (!currentUser.value) return

    const userRef = doc(firestore, 'users', currentUser.value.id)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      const newCount = (data.posts || 0) + 1

      await setDoc(userRef, { ...data, posts: newCount })
      currentUser.value.posts = newCount

      if (isViewingOwnProfile()) {
        viewingUser.value.posts = newCount
      }
    }
  }

  async function fetchRecentUsers(max = 5) {
    try {
      const q = query(collection(firestore, 'users'), limit(max))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      console.error('Failed to fetch recent users:', err)
      return []
    }
  }

  return {
    currentUser,
    viewingUser,
    loading,
    init,
    logout,
    isViewingOwnProfile,
    viewUserProfile,
    followUser,
    fetchRecommendedFollows,
    followingUser,
    incrementUserPostCount,
    fetchRecentUsers
  }
})
