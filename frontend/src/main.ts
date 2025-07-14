import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { setupAuthGuards } from './router/guards'
import { setupPermissionDirective } from './directives/has-permission'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Configuration des gardes d'authentification
setupAuthGuards(router)

// Enregistrement de la directive v-has-permission
setupPermissionDirective(app)

app.mount('#app')