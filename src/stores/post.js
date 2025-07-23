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

    const userAllergens = userStore.currentUser.allergens.map(a => a.toLowerCase())

    return postList.filter(post => {
      const ingredients = (post.ingredients || []).map(i => i.toLowerCase())
      return !ingredients.some(ingredient => userAllergens.includes(ingredient))
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

  // Fetch a group's feed
  async function fetchGroupFeed(groupId) {
    loading.value = true
    try {
      // 1. Get group document reference
      const groupDocRef = doc(firestore, 'groups', groupId)

      // 2. Fetch the document
      const groupDocSnap = await getDoc(groupDocRef)

      if (groupDocSnap.exists()) {
        const groupData = groupDocSnap.data()

        // 3. Get post IDs from the feed
        const postIds = Array.isArray(groupData.feed) ? groupData.feed : []

        // 4. Fetch each post by ID
        const postDocs = await Promise.all(
          postIds.map(postId => getDoc(doc(firestore, 'posts', postId)))
        )

        // 5. Filter and format
        loading.value = false
        const allPosts = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))

          return posts.value = applyAllergyFilter(allPosts)
      } else {
        loading.value = false
        return posts.value = [] // No group found
      }
    } catch (error) {
      console.error('Error fetching group feed:', error)
      loading.value = false
      return posts.value = []
    }
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
        loading.value = false
        const allPosts = postDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))

        return posts.value = applyAllergyFilter(allPosts)
      } else {
        loading.value = false
        return posts.value = []
      }
    } catch (error) {
      console.error('Error fetching user feed:', error)
      loading.value = false
      returnposts.value = []
    }
  }

  async function fetchRecentPosts() {
    loading.value = true
    const snapshot = await getDocs(collection(firestore, 'posts'))
    posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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