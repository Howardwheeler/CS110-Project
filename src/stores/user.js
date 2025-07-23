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
          following: [],
          posts: [],
          allergens: [],
        }

        const formattedUser = {
          id: user.uid,
          email: user.email,
          following: data.following || [],
          posts: data.posts || [],
          allergens: data.allergens || [],
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

  async function getUser(userId) {
    const userDoc = await getDoc(doc(firestore, 'users', userId))
    return userDoc.exists() ? { id: userId, ...userDoc.data() } : null
  }

  async function addUserFeed(userId, postId) {
    const user = await getUser(userId)
    if (user) {
      const updatedFeed = [postId, ...(user.feed || [])]
      await setDoc(doc(firestore, 'users', userId), { ...user, feed: updatedFeed }, { merge: true })
    }
  }

  async function addUserPost(userId, postId) {
    const user = await getUser(userId)
    if (user) {
      const updatedPosts = [postId, ...(user.posts || [])]
      await setDoc(doc(firestore, 'users', userId), { ...user, posts: updatedPosts }, { merge: true })
    }
  }

  async function setUserAllergens(allergens) {
    if (!currentUser.value) return
    const userRef = doc(firestore, 'users', currentUser.value.id)
    await setDoc(userRef, { ...currentUser.value, allergens }, { merge: true })
    currentUser.value.allergens = allergens
  }

  async function followGroup(groupId) {
    if (!currentUser.value) return
    const userRef = doc(firestore, 'users', currentUser.value.id)
    const updatedFollowing = [...new Set([...(currentUser.value.following || []), groupId])]
    await setDoc(userRef, { ...currentUser.value, following: updatedFollowing }, { merge: true })
    currentUser.value.following = updatedFollowing
  }

  return {
    currentUser,
    viewingUser,
    loading,
    init,
    logout,
    setUserAllergens,
    followGroup,
    getUser,
    addUserFeed,
    addUserPost
  }
})
