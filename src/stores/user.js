import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '@/firebaseResources'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const viewingUser = ref(null)

  // Listen for Firebase login/logout changes
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
          // fallback: user exists in auth but no Firestore doc
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

  // Logout method
  async function logout() {
    await signOut(auth)
    currentUser.value = null
    viewingUser.value = null
  }

  // Optional helpers
  function isViewingOwnProfile() {
    return viewingUser.value?.id === currentUser.value?.id
  }

  function userPosts() {
    return viewingUser.value?.posts?.slice(0, 10) || []
  }

  function viewUserProfile(userData) {
    viewingUser.value = userData
  }

  async function viewOwnPosts(user) {
    const posts = [];

    if (!user?.value?.following || user.value.following.length === 0) {
      return posts; // return empty if no followings
    }

    // For each following user, fetch their posts
    for (let followedUserId of user.value.following) {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", followedUserId)
      );

      const querySnapshot = await getDocs(postsQuery);
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
    }

    return posts;
  }

  return {
    currentUser,
    viewingUser,
    init,
    logout,
    isViewingOwnProfile,
    userPosts,
    viewUserProfile,
    viewOwnPosts
  }
})
