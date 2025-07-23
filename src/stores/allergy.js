import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseResources'

export const useAllergyStore = defineStore('allergy', () => {
  const allergies = ref([])
  const newAllergen = ref('') // <-- New ref

  async function fetchAllergies() {
    const snapshot = await getDocs(collection(firestore, 'allergies'))
    allergies.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  async function addAllergy(ingredientName) {
    if (!ingredientName.trim()) return
    const allergyRef = doc(firestore, 'allergies', ingredientName)
    const allergySnap = await getDoc(allergyRef)

    if (!allergySnap.exists()) {
      await setDoc(allergyRef, { name: ingredientName })
      await fetchAllergies()
    }
  }

  return {
    allergies,
    newAllergen,
    fetchAllergies,
    addAllergy,
  }
})
