import Index from '@/views/index.vue'
import LookBook from '@/views/LookBook.vue'
import LookUser from '@/views/LookUser.vue'
import RentService from '@/views/Rent-BuyService.vue'
import LookRentOrder from '@/views/LookRentOrder.vue'
import LookSaleOrder from '@/views/LookSaleOrder.vue'
import Dashboard from '@/views/Dashboard.vue'
import SystemLogs from '@/views/SystemLogs.vue' // 引入组件
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'books', name: 'books', component: LookBook },
        { path: 'users', name: 'users', component: LookUser },
        { path: 'rent-buy', name: 'rent-buy', component: RentService },
        { path: 'rentorder', name: 'rentorder', component: LookRentOrder },
        { path: 'saleorder', name: 'saleorder', component: LookSaleOrder },
        { path: 'logs', name: 'logs', component: SystemLogs } // 注册
      ]
    }
  ],
})

export default router