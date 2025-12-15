<script setup lang="ts">
import List from '@/components/List.vue';
import { RouterLink } from 'vue-router';

</script>
<template>
    <div class="wrapper">
        <List class="left" align-items="center">
            <RouterLink to="/rent-buy" class="links">租借服务</RouterLink>
            <RouterLink to="/books" class="links">图书目录</RouterLink>
            <RouterLink to="/users" class="links">用户目录</RouterLink>
            <RouterLink to="/rentorder" class="links">租书订单目录</RouterLink>
            <RouterLink to="/saleorder" class="links">买书订单目录</RouterLink>

        </List>
        <List class="right">
            <RouterView/>
        </List>
    </div>
</template>
<style>
body{
  overflow: hidden;
}
.top_Inputsearch{
  width: 50%;
}
</style>
<style scoped>
.wrapper {
  height: 100vh;
  border-radius: 20px;
  display: flex;
  background-color: #f9fafb;
}

.left {
  background-color: #FAF7F2;
  color: #4B5563;
  width: 200px;
}

.right {
  flex: 1;
  overflow:hidden ;
  background-color: #FAFAFA;
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
