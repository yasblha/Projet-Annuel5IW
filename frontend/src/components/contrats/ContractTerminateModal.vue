<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg z-50 relative">
      <!-- Header -->
      <div class="bg-primary-600 text-white px-4 py-3 rounded-t-lg">
        <h3 class="text-xl font-bold">Résilier le contrat</h3>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <form ref="form" @submit.prevent="submitResiliation" class="space-y-4">
          <!-- Motif -->
          <div>
            <label for="motifResiliation" class="block text-sm font-medium text-gray-700">Motif de résiliation *</label>
            <input 
              id="motifResiliation"
              v-model="motifResiliation" 
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required 
              :class="{'border-red-500': motifError}"
            />
            <p v-if="motifError" class="mt-1 text-sm text-red-600">{{ motifError }}</p>
          </div>
          
          <!-- Date -->
          <div>
            <label for="dateResiliation" class="block text-sm font-medium text-gray-700">Date de résiliation *</label>
            <input 
              id="dateResiliation"
              v-model="dateResiliation" 
              type="date"
              :min="minDate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          
          <!-- Commentaire -->
          <div>
            <label for="commentaire" class="block text-sm font-medium text-gray-700">Commentaire (optionnel)</label>
            <textarea 
              id="commentaire"
              v-model="commentaire" 
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>
          
          <!-- Error message -->
          <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md">
            {{ errorMessage }}
          </div>
        </form>
      </div>
      
      <!-- Actions -->
      <div class="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
        <button 
          type="button"
          class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="closeModal"
        >
          Annuler
        </button>
        <button 
          type="button"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          :disabled="!isFormValid || isLoading"
          :class="{'opacity-50 cursor-not-allowed': !isFormValid || isLoading}"
          @click="submitResiliation"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Résilier
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, computed, onMounted } from 'vue';
import { useContractStore } from '@/stores/contract.store';
import { storeToRefs } from 'pinia';

export default {
  name: 'ContractTerminateModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    contractId: {
      type: String,
      required: true
    }
  },
  
  emits: ['update:modelValue', 'terminated'],
  
  setup(props, { emit }) {
    const contractStore = useContractStore();
    const { isLoading } = storeToRefs(contractStore);
    
    const form = ref(null);
    const state = reactive({
      isFormValid: true,
      motifResiliation: '',
      dateResiliation: new Date().toISOString().substr(0, 10),
      commentaire: '',
      errorMessage: '',
      motifError: ''
    });

    const isVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    const minDate = computed(() => {
      return new Date().toISOString().substr(0, 10);
    });

    const validateForm = () => {
      state.motifError = '';
      state.isFormValid = true;
      
      if (!state.motifResiliation) {
        state.motifError = 'Le motif est requis';
        state.isFormValid = false;
      } else if (state.motifResiliation.length < 5) {
        state.motifError = 'Le motif doit contenir au moins 5 caractères';
        state.isFormValid = false;
      }
      
      return state.isFormValid;
    };

    const closeModal = () => {
      isVisible.value = false;
      resetForm();
    };

    const resetForm = () => {
      state.motifResiliation = '';
      state.dateResiliation = new Date().toISOString().substr(0, 10);
      state.commentaire = '';
      state.errorMessage = '';
      state.motifError = '';
    };

    const submitResiliation = async () => {
      if (validateForm()) {
        try {
          state.errorMessage = '';
          await contractStore.terminateContract(props.contractId, {
            motifResiliation: state.motifResiliation,
            dateResiliation: new Date(state.dateResiliation),
            commentaire: state.commentaire
          });
          
          emit('terminated');
          closeModal();
        } catch (error) {
          console.error('Erreur de résiliation:', error);
          state.errorMessage = error.response?.data?.message || 'Une erreur s\'est produite lors de la résiliation du contrat';
        }
      }
    };

    onMounted(() => {
      resetForm();
    });

    return {
      ...toRefs(state),
      isVisible,
      isLoading,
      form,
      minDate,
      closeModal,
      submitResiliation,
      validateForm
    };
  }
};
</script>
