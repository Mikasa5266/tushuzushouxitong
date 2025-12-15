<script setup lang="ts">
import List from '@/components/List.vue';
import { RouterLink } from 'vue-router';

</script>
<template>
    <div class="wrapper">
        <List class="left" align-items="center">
            <!-- 添加系统标题/Logo区域 -->
            <div class="logo-area">
                <h2>📚 图书租售系统</h2>
            </div>
            
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
            <!-- 添加一个淡入动画效果 (可选，视个人喜好) -->
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
  background-color: #f0f2f5; /* 升级：整体背景色更柔和 */
}
/* 升级：优化搜索框容器样式 */
.top_Inputsearch{
  width: 50%;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); /* 添加轻微阴影 */
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
  /* 升级：侧边栏改为深色或更专业的配色，这里使用清爽的白底加阴影 */
  background-color: #ffffff;
  color: #4B5563;
  width: 240px; /*稍微加宽 */
  box-shadow: 2px 0 8px rgba(0,0,0,0.05); /* 添加右侧阴影 */
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

/* 升级：内容区域添加白色卡片背景容器 */
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
  border-radius: 12px; /* 圆角更大 */
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
  transform: translateX(5px); /* 悬停微动特效 */
}

/* Vue Router 自动激活的类名 */
.router-link-active {
    background-color: #1890ff;
    color: white !important;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3); /* 激活状态阴影 */
}

.router-link-active:hover {
    background-color: #40a9ff;
    color: white !important;
}
</style>