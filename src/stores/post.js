import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, doc, getDoc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/firebaseResources'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const loading = ref(false)
  const userStore = useUserStore()
  const groupStore = useGroupStore()
  const allergyFilterEnabled = ref(false)

  function toggleAllergyFilter() {
    allergyFilterEnabled.value = !allergyFilterEnabled.value
  }

  function applyAllergyFilter(postList) {
    if (!allergyFilterEnabled.value || !userStore.currentUser?.allergens?.length) {
      return postList
    }

    const userAllergens = userStore.currentUser.allergens.map(a =>
      a.toLowerCase().trim()
    )

    return postList.filter(post => {
      if (!Array.isArray(post.ingredients) || post.ingredients.length === 0) {
        return true
      }

      const hasAllergen = post.ingredients.some(ingredient => {
        let ingredientName = ''
        if (typeof ingredient === 'string') {
          ingredientName = ingredient.toLowerCase().trim()
        } else if (ingredient?.name) {
          ingredientName = String(ingredient.name).toLowerCase().trim()
        }
        if (!ingredientName) return false
        return userAllergens.some(allergen => ingredientName.includes(allergen))
      })

      return !hasAllergen
    })
  }

  // Create a post and update user/group feeds
  async function createPost({ group, description, ingredients, steps }) {
    const existingGroup = await groupStore.getGroup(group)
    if (!existingGroup) {
      await groupStore.createGroup({ name: group })
    }

    // Create the post
    const postRef = await addDoc(collection(firestore, 'posts'), {
      userId: userStore.currentUser.id,
      email: userStore.currentUser.email,
      group,
      description,
      ingredients,
      steps,
      timestamp: serverTimestamp(),
    })

    // Add post to user's feed
    await userStore.addUserFeed(userStore.currentUser.id, postRef.id)
    await userStore.addUserPost(userStore.currentUser.id, postRef.id)

    // If post is for a group, add to group feed
    await groupStore.addGroupFeed(group, postRef.id)

    await fetchRecentPosts()
    await groupStore.fetchGroups()
  }

  async function getPost(postId) {
    const postDoc = await getDoc(doc(firestore, 'posts', postId))
    return postDoc.exists() ? { id: postId, ...postDoc.data() } : null
  }

  async function fetchUserFeed(userId) {
    loading.value = true
    try {
      const userDocRef = doc(firestore, 'users', userId)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const postIds = Array.isArray(userData.feed) ? userData.feed : []
        const postDocs = await Promise.all(
          postIds.map(postId => getDoc(doc(firestore, 'posts', postId)))
        )
        const allPosts = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
        posts.value = applyAllergyFilter(allPosts)
        loading.value = false
        return posts.value
      } else {
        posts.value = []
        loading.value = false
        return posts.value
      }
    } catch (error) {
      posts.value = []
      loading.value = false
      return posts.value
    }
  }

  async function fetchGroupFeed(groupId) {
    loading.value = true
    try {
      const groupDocRef = doc(firestore, 'groups', groupId)
      const groupDocSnap = await getDoc(groupDocRef)

      if (groupDocSnap.exists()) {
        const groupData = groupDocSnap.data()
        const postIds = Array.isArray(groupData.feed) ? groupData.feed : []
        const postDocs = await Promise.all(
          postIds.map(postId => getDoc(doc(firestore, 'posts', postId)))
        )
        const allPosts = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
        posts.value = applyAllergyFilter(allPosts)
        loading.value = false
        return posts.value
      } else {
        posts.value = []
        loading.value = false
        return posts.value
      }
    } catch (error) {
      posts.value = []
      loading.value = false
      return posts.value
    }
  }

  async function fetchRecentPosts() {
    loading.value = true
    const snapshot = await getDocs(collection(firestore, 'posts'))
    const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    posts.value = applyAllergyFilter(allPosts)
    loading.value = false
  }

  return {
    posts,
    loading,
    allergyFilterEnabled,
    createPost,
    fetchUserFeed,
    fetchGroupFeed,
    fetchRecentPosts,
    getPost,
    toggleAllergyFilter,
    applyAllergyFilter
  }
})