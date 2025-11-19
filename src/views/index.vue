<script setup lang="ts">
import List from '@/components/List.vue';
import { Button } from 'ant-design-vue';
import { RouterLink } from 'vue-router';

</script>
<template>
    <div class="wrapper">
        <List class="left" align-items="center">
            <RouterLink to="/rent" class="links">租借服务</RouterLink>
            <RouterLink to="/sale" class="links">出售服务</RouterLink>
            <RouterLink to="/books" class="links">图书目录</RouterLink>
            <RouterLink to="/users" class="links">用户目录</RouterLink>
        </List>
        <List class="right">
            <RouterView/>
        </List>
    </div>
</template>
<style scoped>
.wrapper {
  height: 100vh;
  border-radius: 20px;
  display: flex;
  background-color: #f9fafb;
}

.left {
  background: linear-gradient(135deg, #d7e2e9, #f3f6f9); /* 柔和渐变 */
  width: 200px;
}

.right {
  flex: 1;
  overflow-x:auto ;
  background-color: #ffffff;
  padding: 24px;
}

.links {
  text-decoration: none;
  font-size: 16px;
  color: #444;
  margin: 12px 0;
  padding: 8px 12px;
  border-radius: 8px;
  transition: 0.3s;
}

.links:hover {
  background-color: #e6f4ff;
  color: #1677ff;
}
</style>
