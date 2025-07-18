<template>
  <div class="contract-v2-debugger">
    <h1 class="text-2xl font-bold mb-4">Contract-V2 Service Debugger</h1>
    
    <div class="mb-6 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Service Status</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        @click="pingService"
        :disabled="isPinging"
      >
        {{ isPinging ? 'Pinging...' : 'Ping Service' }}
      </button>
      
      <div v-if="pingResult" class="mt-3">
        <div :class="pingResult.success ? 'text-green-600' : 'text-red-600'" class="font-semibold">
          {{ pingResult.message }}
        </div>
        <pre v-if="pingResult.data" class="bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-auto max-h-60">{{ JSON.stringify(pingResult.data, null, 2) }}</pre>
        <pre v-if="pingResult.error" class="bg-gray-800 text-red-400 p-3 rounded mt-2 overflow-auto max-h-60">{{ JSON.stringify(pingResult.error, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="mb-6 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Authentication Status</h2>
      <div class="mb-3">
        <div class="font-medium">Token Status:</div>
        <div v-if="hasToken" class="text-green-600">Token présent</div>
        <div v-else class="text-red-600">Token absent</div>
      </div>
      
      <div class="mb-3" v-if="hasToken">
        <div class="font-medium">Token Expiration:</div>
        <div :class="isTokenExpired ? 'text-red-600' : 'text-green-600'">
          {{ isTokenExpired ? 'Expiré' : 'Valide' }} 
          <span v-if="tokenExpiration">({{ tokenExpiration }})</span>
        </div>
      </div>
      
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="refreshToken"
        :disabled="isRefreshing"
      >
        {{ isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir Token' }}
      </button>
    </div>
    
    <div class="mb-6 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Templates</h2>
      <div class="flex mb-3">
        <button 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          @click="listTemplates"
          :disabled="isLoadingTemplates"
        >
          {{ isLoadingTemplates ? 'Chargement...' : 'Lister Templates' }}
        </button>
        
        <button 
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          @click="debugListTemplates"
          :disabled="isDebugLoading"
        >
          {{ isDebugLoading ? 'Debug...' : 'Debug Templates' }}
        </button>
      </div>
      
      <div v-if="templatesError" class="text-red-600 mb-3">
        {{ templatesError }}
      </div>
      
      <div v-if="templates.length > 0" class="mt-3">
        <div class="text-green-600 font-semibold mb-2">
          {{ templates.length }} templates récupérés
        </div>
        <div class="overflow-auto max-h-60">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="template in templates" :key="template.id">
                <td class="py-2 px-4 border-b border-gray-200">{{ template.id }}</td>
                <td class="py-2 px-4 border-b border-gray-200">{{ template.name }}</td>
                <td class="py-2 px-4 border-b border-gray-200">
                  <button 
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    @click="getTemplateDetails(template.id)"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-if="currentTemplate" class="mt-4 bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-60">
        <pre>{{ JSON.stringify(currentTemplate, null, 2) }}</pre>
      </div>
      
      <div v-if="debugResult" class="mt-4">
        <div :class="debugResult.success ? 'text-green-600' : 'text-red-600'" class="font-semibold">
          {{ debugResult.success ? 'Debug réussi' : debugResult.message }}
        </div>
        <pre class="bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-auto max-h-60">{{ JSON.stringify(debugResult.data, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Logs</h2>
      <div class="flex mb-3">
        <button 
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          @click="clearLogs"
        >
          Effacer logs
        </button>
      </div>
      
      <div class="bg-gray-800 text-gray-200 p-3 rounded overflow-auto max-h-96">
        <div v-for="(log, index) in logs" :key="index" :class="getLogClass(log)">
          <span class="text-gray-400">[{{ formatTime(log.timestamp) }}]</span> {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useContractV2Store } from '@/stores/contract-v2.store';
import { useAuthStore } from '@/stores/auth.store';
import { storeToRefs } from 'pinia';

const contractV2Store = useContractV2Store();
const authStore = useAuthStore();

// Refs depuis le store
const { 
  templates, 
  currentTemplate, 
  isLoadingTemplates,
  templatesError
} = storeToRefs(contractV2Store);

// État local
const logs = ref([]);
const isPinging = ref(false);
const isRefreshing = ref(false);
const isDebugLoading = ref(false);
const pingResult = ref(null);
const debugResult = ref(null);

// Computed
const hasToken = computed(() => {
  return !!authStore.token;
});

const isTokenExpired = computed(() => {
  if (!authStore.token) return true;
  
  try {
    const payload = JSON.parse(atob(authStore.token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expirationTime;
  } catch (error) {
    addLog('Erreur lors de la vérification de l\'expiration du token', 'error');
    return true;
  }
});

const tokenExpiration = computed(() => {
  if (!authStore.token) return null;
  
  try {
    const payload = JSON.parse(atob(authStore.token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const expirationDate = new Date(expirationTime);
    return expirationDate.toLocaleString();
  } catch (error) {
    return null;
  }
});

// Méthodes
function addLog(message, type = 'info') {
  logs.value.unshift({
    message,
    type,
    timestamp: new Date()
  });
}

function clearLogs() {
  logs.value = [];
}

function formatTime(date) {
  return date.toLocaleTimeString();
}

function getLogClass(log) {
  switch (log.type) {
    case 'error':
      return 'text-red-400';
    case 'success':
      return 'text-green-400';
    case 'warning':
      return 'text-yellow-400';
    default:
      return '';
  }
}

async function pingService() {
  isPinging.value = true;
  addLog('Ping du service contract-v2...');
  
  try {
    pingResult.value = await contractV2Store.diagnoseService();
    
    if (pingResult.value.success) {
      addLog('Service contract-v2 accessible', 'success');
    } else {
      addLog(`Service contract-v2 inaccessible: ${pingResult.value.message}`, 'error');
    }
  } catch (error) {
    addLog(`Erreur lors du ping: ${error.message}`, 'error');
    pingResult.value = {
      success: false,
      message: `Erreur: ${error.message}`,
      error
    };
  } finally {
    isPinging.value = false;
  }
}

async function refreshToken() {
  isRefreshing.value = true;
  addLog('Rafraîchissement du token...');
  
  try {
    const result = await authStore.refreshToken();
    
    if (result) {
      addLog('Token rafraîchi avec succès', 'success');
    } else {
      addLog('Échec du rafraîchissement du token', 'error');
    }
  } catch (error) {
    addLog(`Erreur lors du rafraîchissement du token: ${error.message}`, 'error');
  } finally {
    isRefreshing.value = false;
  }
}

async function listTemplates() {
  addLog('Récupération des templates...');
  
  try {
    const result = await contractV2Store.listTemplates();
    addLog(`${templates.value.length} templates récupérés`, 'success');
  } catch (error) {
    addLog(`Erreur lors de la récupération des templates: ${error.message}`, 'error');
  }
}

async function getTemplateDetails(id) {
  addLog(`Récupération des détails du template ${id}...`);
  
  try {
    const result = await contractV2Store.getTemplateById(id);
    if (result) {
      addLog(`Détails du template ${id} récupérés`, 'success');
    } else {
      addLog(`Échec de la récupération des détails du template ${id}`, 'error');
    }
  } catch (error) {
    addLog(`Erreur lors de la récupération des détails du template: ${error.message}`, 'error');
  }
}

async function debugListTemplates() {
  isDebugLoading.value = true;
  addLog('Debug: Récupération des templates...');
  
  try {
    debugResult.value = await contractV2Store.debugListTemplates();
    
    if (debugResult.value.success) {
      addLog('Debug templates réussi', 'success');
    } else {
      addLog(`Debug templates échoué: ${debugResult.value.message}`, 'error');
    }
  } catch (error) {
    addLog(`Erreur lors du debug des templates: ${error.message}`, 'error');
    debugResult.value = {
      success: false,
      message: `Erreur: ${error.message}`,
      error
    };
  } finally {
    isDebugLoading.value = false;
  }
}

// Initialisation
onMounted(() => {
  addLog('Composant de debug initialisé');
  
  // Vérifier l'état du token
  if (hasToken.value) {
    addLog('Token présent', 'success');
    if (isTokenExpired.value) {
      addLog('Token expiré', 'warning');
    } else {
      addLog('Token valide', 'success');
    }
  } else {
    addLog('Token absent', 'error');
  }
});
</script>

<style scoped>
.contract-v2-debugger {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
