<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
})
const loading = ref(false)
const errorMessage = ref('')
const successMessage = computed(() => route.query.registered === '1' ? '注册成功，请登录' : '')

async function submitLogin() {
  errorMessage.value = ''

  if (!form.username.trim()) {
    errorMessage.value = '用户名不能为空'
    return
  }
  if (!form.password.trim()) {
    errorMessage.value = '密码不能为空'
    return
  }

  loading.value = true
  try {
    const user = await login({
      username: form.username.trim(),
      password: form.password,
    })
    userStore.setUser(user)
    await router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '用户名或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel" aria-labelledby="login-title">
      <div class="auth-heading">
        <p class="eyebrow">Welcome back</p>
        <h1 id="login-title">登录博客</h1>
        <p>使用你的用户名和密码进入博客管理区。</p>
      </div>

      <p v-if="successMessage" class="message success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>

      <form class="auth-form" @submit.prevent="submitLogin">
        <label for="login-username">
          用户名
          <input
            id="login-username"
            v-model="form.username"
            autocomplete="username"
            placeholder="请输入用户名"
            type="text"
          />
        </label>

        <label for="login-password">
          密码
          <input
            id="login-password"
            v-model="form.password"
            autocomplete="current-password"
            placeholder="请输入密码"
            type="password"
          />
        </label>

        <button class="primary-button" :disabled="loading" type="submit">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="auth-switch">
        还没有账号？
        <RouterLink to="/register">去注册</RouterLink>
      </p>
    </section>
  </main>
</template>
