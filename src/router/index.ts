import Index from '@/views/index.vue'
import LookBook from '@/views/LookBook.vue'
import LookUser from '@/views/LookUser.vue'
import RentService from '@/views/RentService.vue'
import SaleService from '@/views/SaleService.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
      children: [
        {
          path: 'books',
          name: 'books',
          component: LookBook
        },
        {
          path:'users',
          name:'users',
          component:LookUser
        },{
          path:'rent',
          name:'rent',
          component:RentService
        },
        {
          path:'sale',
          name:'sale',
          component:SaleService
        }
      ]
    }
  ],
})

export default router
