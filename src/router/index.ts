import Index from '@/views/index.vue'
import LookBook from '@/views/LookBook.vue'
import LookUser from '@/views/LookUser.vue'
import RentService from '@/views/Rent-BuyService.vue'
import LookRentOrder from '@/views/LookRentOrder.vue'
import { createRouter, createWebHistory } from 'vue-router'
import LookSaleOrder from '@/views/LookSaleOrder.vue'

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
          path:'rent-buy',
          name:'rent-buy',
          component:RentService
        },{
          path:'rentorder',
          name:'rentorder',
          component:LookRentOrder
        },
        {
          path:'saleorder',
          name:'saleorder',
          component:LookSaleOrder
        }
      ]
    }
  ],
})

export default router
