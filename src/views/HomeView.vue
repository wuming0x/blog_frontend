<script setup>
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <main class="home-page">
    <section class="home-hero">
      <p class="eyebrow">Blog Dashboard</p>
      <h1>个人博客</h1>
      <p class="hero-copy">
        一个简洁的博客前端入口，已经接入后端用户注册和登录接口。
      </p>

      <div v-if="userStore.isLoggedIn" class="welcome-panel">
        <p>欢迎回来，{{ userStore.user.username }}</p>
        <span>你已经登录，可以继续扩展文章、评论和个人中心功能。</span>
      </div>

      <div v-else class="hero-actions">
        <RouterLink class="primary-button link-button" to="/login">登录</RouterLink>
        <RouterLink class="secondary-button link-button" to="/register">注册账号</RouterLink>
      </div>
    </section>
  </main>
</template>
