import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../practicando/views/home-view.vue'
import GraphView from '../practicando/views/graph-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/graph', 
      name: 'graph',
      component: GraphView 
    }
  ]
})

export default router
