import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ToastService from 'primevue/toastservice';

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/saga-blue/theme.css' //tema
import 'primevue/resources/primevue.min.css' //core css

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(ToastService);
app.use(PrimeVue)
app.use(createPinia())
app.use(router)

app.mount('#app')
