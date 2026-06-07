<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { register } from '@/api/user'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})
const loading = ref(false)
const errorMessage = ref('')

async function submitRegister() {
  errorMessage.value = ''

  if (!form.username.trim()) {
    errorMessage.value = '用户名不能为空'
    return
  }
  if (!form.password.trim()) {
    errorMessage.value = '密码不能为空'
    return
  }
  if (form.password !== form.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    await register({
      username: form.username.trim(),
      password: form.password,
    })
    await router.push({ path: '/login', query: { registered: '1' } })
  } catch (error) {
    errorMessage.value = error.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel" aria-labelledby="register-title">
      <div class="auth-heading">
        <p class="eyebrow">Create account</p>
        <h1 id="register-title">注册账号</h1>
        <p>创建一个账号，开始记录和管理你的内容。</p>
      </div>

      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>

      <form class="auth-form" @submit.prevent="submitRegister">
        <label for="register-username">
          用户名
          <input
            id="register-username"
            v-model="form.username"
            autocomplete="username"
            placeholder="请输入用户名"
            type="text"
          />
        </label>

        <label for="register-password">
          密码
          <input
            id="register-password"
            v-model="form.password"
            autocomplete="new-password"
            placeholder="请输入密码"
            type="password"
          />
        </label>

        <label for="register-confirm-password">
          确认密码
          <input
            id="register-confirm-password"
            v-model="form.confirmPassword"
            autocomplete="new-password"
            placeholder="请再次输入密码"
            type="password"
          />
        </label>

        <button class="primary-button" :disabled="loading" type="submit">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="auth-switch">
        已经有账号？
        <RouterLink to="/login">去登录</RouterLink>
      </p>
    </section>
  </main>
</template>
