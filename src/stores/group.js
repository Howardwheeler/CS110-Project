import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseResources'

export const useGroupStore = defineStore('group', () => {
    const groups = ref([])
    const currentGroup = ref(null)

    async function fetchGroups() {
        const snapshot = await getDocs(collection(firestore, 'groups'))
        groups.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    async function createGroup({ name }) {
        await setDoc(doc(firestore, 'groups', name), { name, feed: [] })
        await fetchGroups()
    }

    async function addGroupFeed(groupName, postId) {
        const groupRef = doc(firestore, 'groups', groupName)
        const groupSnap = await getDoc(groupRef)

        if (groupSnap.exists()) {
            const groupData = groupSnap.data()
            const feed = Array.isArray(groupData.feed) ? groupData.feed : []

            // Only add if not already present
            if (!feed.includes(postId)) {
            feed.push(postId)
            try {
                await updateDoc(groupRef, { feed })
            } catch (err) {
                console.error("Error updating group feed:", err)
            }
            }
        } else {
            // Create the group and then re-attempt adding the feed
            await createGroup({ name: groupName })
            await addGroupFeed(groupName, postId)  // ✅ Added await
        }

        await fetchGroups()
    }

    async function getGroup(groupId) {
        const groupDoc = await getDoc(doc(firestore, 'groups', groupId))
        return groupDoc.exists() ? { id: groupId, ...groupDoc.data() } : null
    }

    async function initGroup(groupId) {
        const group = await getGroup(groupId)
        currentGroup.value = group
    }

    async function getRecommendedGroups(userId) {
        const userDoc = await getDoc(doc(firestore, 'users', userId))
        const following = userDoc.exists() ? userDoc.data().following || [] : []

        // Don't exclude currentGroup when on profile page - only exclude if we're actually viewing that group's page
        // You can pass a flag or check route to determine this, but for now just don't filter by currentGroup
        
        // Make sure groups are loaded
        if (!groups.value.length) await fetchGroups()

        return groups.value
            .filter(group =>
                !following.includes(group.id)
            )
            .slice(0, 5)
    } 

    return { groups, fetchGroups, createGroup, getGroup, addGroupFeed, initGroup, currentGroup, getRecommendedGroups }
    })