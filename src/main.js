import Vue from 'vue'
import VueMaterial from 'vue-material'
import App from './App.vue'

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(VueMaterial)

// Vue Material theme
// Vue.material.registerTheme('default', {
//   primary: 'blue',
//   accent: 'white',
//   warn: 'red',
//   background: 'grey'
// })

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
