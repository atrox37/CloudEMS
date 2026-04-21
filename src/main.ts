import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/es/components/notification/style/css'

import App from './App.vue'
import router from './router'
import './router/guard'
import { permissionDirective } from './utils/directives'
import { initResponsive } from './utils/responsive'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.directive('permission', permissionDirective)

initResponsive()
app.mount('#app')
