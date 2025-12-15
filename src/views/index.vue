<script setup lang="ts">
import List from '@/components/List.vue';
import { RouterLink } from 'vue-router';

</script>
<template>
    <div class="wrapper">
        <List class="left" align-items="center">
            <!-- 系统标题 -->
            <div class="logo-area">
                <h2>📚 图书租售系统</h2>
            </div>
            
            <!-- 新增：仪表盘入口 -->
            <RouterLink to="/dashboard" class="links">
                <span class="icon">📊</span> 仪表盘
            </RouterLink>

            <RouterLink to="/rent-buy" class="links">
                <span class="icon">🛒</span> 租借/购买服务
            </RouterLink>
            <RouterLink to="/books" class="links">
                <span class="icon">📖</span> 图书目录
            </RouterLink>
            <RouterLink to="/users" class="links">
                <span class="icon">👥</span> 用户目录
            </RouterLink>
            <RouterLink to="/rentorder" class="links">
                <span class="icon">📄</span> 租书订单
            </RouterLink>
            <RouterLink to="/saleorder" class="links">
                <span class="icon">💰</span> 售书订单
            </RouterLink>

        </List>
        <List class="right">
            <!-- 内容区域 -->
            <div class="content-container">
                <RouterView/>
            </div>
        </List>
    </div>
</template>
<style>
body{
  margin: 0;
  overflow: hidden;
  background-color: #f0f2f5; 
}
.top_Inputsearch{
  width: 50%;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-radius: 8px;
}
</style>
<style scoped>
.wrapper {
  height: 100vh;
  display: flex;
  background-color: #f0f2f5;
}

.left {
  background-color: #ffffff;
  color: #4B5563;
  width: 240px; 
  box-shadow: 2px 0 8px rgba(0,0,0,0.05); 
  z-index: 10;
  padding-top: 20px;
}

.logo-area {
    margin-bottom: 30px;
    font-weight: bold;
    color: #1890ff;
    text-align: center;
}

.right {
  flex: 1;
  overflow: hidden;
  background-color: #f0f2f5;
  padding: 24px;
}

.content-container {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    /* 隐藏滚动条但保留功能 */
    scrollbar-width: none; 
}

.links {
  text-decoration: none;
  font-size: 16px;
  color: #666;
  margin: 8px 16px;
  padding: 12px 20px;
  border-radius: 12px; 
  transition: all 0.3s ease;
  width: 90%;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.icon {
    font-size: 18px;
}

.links:hover {
  background-color: #e6f7ff;
  color: #1890ff;
  transform: translateX(5px); 
}

.router-link-active {
    background-color: #1890ff;
    color: white !important;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3); 
}

.router-link-active:hover {
    background-color: #40a9ff;
    color: white !important;
}
</style>