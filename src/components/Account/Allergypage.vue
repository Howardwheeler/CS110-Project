<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAllergyStore } from '@/stores/allergy'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const allergyStore = useAllergyStore()

const selectedAllergens = ref([])

onMounted(async () => {
  await allergyStore.fetchAllergies()

  if (userStore.currentUser?.allergens?.length) {
    selectedAllergens.value = [...userStore.currentUser.allergens]
  }
})

function toggleAllergen(ingredient) {
  if (selectedAllergens.value.includes(ingredient)) {
    selectedAllergens.value = selectedAllergens.value.filter(a => a !== ingredient)
  } else {
    selectedAllergens.value.push(ingredient)
  }
}

async function addNewAllergen() {
  const name = allergyStore.newAllergen.trim()
  if (!name) return

  await allergyStore.addAllergy(name)
  allergyStore.newAllergen = ''

  if (!selectedAllergens.value.includes(name)) {
    selectedAllergens.value.push(name)
  }
}

async function saveAllergies() {
  await userStore.setUserAllergens(selectedAllergens.value)
  router.push('/user')
}
</script>

<template>
  <div class="allergen-container">
    <div class="allergen-card">
      <div class="allergen-header">
        <h1 class="allergen-title">Select Your Allergens</h1>
        <p class="allergen-subtitle">
          Choose the ingredients you're allergic to so we can filter recipes accordingly
        </p>
      </div>

      <div class="allergen-grid">
        <div 
          v-for="allergy in allergyStore.allergies" 
          :key="allergy.id" 
          class="allergen-item"
          :class="{ selected: selectedAllergens.includes(allergy.name) }"
          @click="toggleAllergen(allergy.name)"
        >
          <div class="allergen-checkbox">
            <input
              type="checkbox"
              :value="allergy.name"
              v-model="selectedAllergens"
              class="checkbox-input"
            />
            <div class="checkbox-custom"></div>
          </div>
          <span class="allergen-name">{{ allergy.name }}</span>
        </div>
      </div>

      <div class="add-allergen-section">
        <h3 class="section-title">Add Custom Allergen</h3>
        <div class="add-allergen-form">
          <input
            type="text"
            v-model="allergyStore.newAllergen"
            placeholder="Enter allergen name"
            class="allergen-input"
            @keyup.enter="addNewAllergen"
          />
          <button @click="addNewAllergen" class="btn btn-secondary">
            Add
          </button>
        </div>
      </div>

      <div class="selected-count" v-if="selectedAllergens.length > 0">
        <span class="count-badge">{{ selectedAllergens.length }}</span>
        <span class="count-text">allergen{{ selectedAllergens.length !== 1 ? 's' : '' }} selected</span>
      </div>

      <div class="form-actions">
        <button @click="saveAllergies" class="btn btn-primary">
          Save & Continue
        </button>
        <button @click="router.push('/user')" class="btn btn-outline">
          Skip for Now
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.allergen-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.allergen-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 700px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.allergen-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
}

.allergen-header {
  text-align: center;
  margin-bottom: 32px;
}

.allergen-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.allergen-subtitle {
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.allergen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.allergen-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.allergen-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.allergen-item.selected {
  background: #ede9fe;
  border-color: #667eea;
  color: #5b21b6;
}

.allergen-checkbox {
  position: relative;
  display: flex;
  align-items: center;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allergen-item.selected .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.allergen-item.selected .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.allergen-name {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.allergen-item.selected .allergen-name {
  color: #5b21b6;
  font-weight: 600;
}

.add-allergen-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.add-allergen-form {
  display: flex;
  gap: 12px;
}

.allergen-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #374151;
  background: white;
  transition: all 0.2s;
}

.allergen-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.allergen-input::placeholder {
  color: #9ca3af;
}

.selected-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #e0f2fe;
}

.count-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.count-text {
  color: #0c4a6e;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-direction: column;
}

.btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 2px solid #e5e7eb;
  padding: 12px 20px;
  min-height: 44px;
  flex-shrink: 0;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .allergen-container {
    padding: 16px;
  }
  
  .allergen-card {
    padding: 24px;
  }
  
  .allergen-title {
    font-size: 24px;
  }
  
  .allergen-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .add-allergen-form {
    flex-direction: column;
  }
  
  .form-actions {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .allergen-grid {
    grid-template-columns: 1fr;
  }
  
  .allergen-item {
    padding: 12px;
  }
}
</style>