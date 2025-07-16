import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore'
import { auth, firestore } from '@/firebaseResources'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const viewingUser = ref(null)
  const loading = ref(false)

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

  async function logout() {
    await signOut(auth)
    currentUser.value = null
    viewingUser.value = null
  }

  function isViewingOwnProfile() {
    return viewingUser.value?.id === currentUser.value?.id
  }

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

  async function followUser(targetId) {
    if (!currentUser.value) return

    const userDocRef = doc(firestore, 'users', currentUser.value.id)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const data = userDoc.data()
      const updatedFollowing = [...data.following, targetId]

      await setDoc(userDocRef, {
        ...data,
        following: updatedFollowing
      })

      currentUser.value.following = updatedFollowing
    }
  }

  async function fetchRecommendedFollows() {
    const usersSnapshot = await getDocs(collection(firestore, 'users'))
    return usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user =>
        user.id !== currentUser.value.id &&
        !currentUser.value.following.includes(user.id)
      )
  }

  function followingUser(userId) {
    return currentUser.value?.following?.includes(userId) || false
  }


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
    incrementUserPostCount
  }
})
