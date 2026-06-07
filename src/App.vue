<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function handleLogout() {
  userStore.logout()
  await router.push('/')
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">Blog</RouterLink>

      <nav class="site-nav" aria-label="主导航">
        <RouterLink to="/">首页</RouterLink>
        <template v-if="!userStore.isLoggedIn">
          <RouterLink to="/login">登录</RouterLink>
          <RouterLink to="/register">注册</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/articles/new">发布文章</RouterLink>
          <span class="current-user">{{ userStore.user.username }}</span>
          <button class="text-button" type="button" @click="handleLogout">退出</button>
        </template>
      </nav>
    </header>

    <RouterView />
  </div>
</template>
