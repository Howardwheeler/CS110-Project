import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/firebaseResources'
import { useUserStore } from './user'

export const usePostStore = defineStore('post', () => {
  //initial constructor
  const posts = ref([])
  const loading = ref(false)
  const userStore = useUserStore()

  //async call to add to post document with new data, then update feed
  async function createPost(content) {
    await addDoc(collection(firestore, 'posts'), {
      userId: userStore.currentUser.id,
      email: userStore.currentUser.email,
      content,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: serverTimestamp()
    })
    await fetchFeed(userStore.currentUser)
  }

  //fetch user feed using query to list out post then map it onto post
  async function fetchFeed(user) {
    loading.value = true
    const ids = [user.id, ...(user.following || [])].slice(0, 10)

    const q = query(
      collection(firestore, 'posts'),
      where('userId', 'in', ids),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  }

  //fetch feed for specific user
  async function fetchUserPosts(userId) {
    loading.value = true

    const q = query(
      collection(firestore, 'posts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    posts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  }

  return { posts, loading, createPost, fetchFeed, fetchUserPosts }
})
