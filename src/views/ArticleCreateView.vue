<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createArticle } from '@/api/article'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  title: '',
  summary: '',
  content: '',
})
const loading = ref(false)
const errorMessage = ref('')

async function submitArticle() {
  errorMessage.value = ''

  if (!form.title.trim()) {
    errorMessage.value = '标题不能为空'
    return
  }
  if (!form.content.trim()) {
    errorMessage.value = '正文不能为空'
    return
  }

  loading.value = true
  try {
    const article = await createArticle(
      {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
      },
      userStore.user?.token,
    )
    await router.push(`/articles/${article.id}`)
  } catch (error) {
    errorMessage.value = error.message || '文章发布失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="editor-page">
    <section class="editor-panel" aria-labelledby="create-article-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Create Article</p>
          <h1 id="create-article-title">发布文章</h1>
          <p class="hero-copy">填写标题和正文即可发布。摘要可留空，后端会自动生成。</p>
        </div>
      </div>

      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>

      <form class="article-form" @submit.prevent="submitArticle">
        <label for="article-title">
          标题
          <input id="article-title" v-model="form.title" placeholder="请输入文章标题" type="text" />
        </label>

        <label for="article-summary">
          摘要
          <input id="article-summary" v-model="form.summary" placeholder="可选，留空自动生成" type="text" />
        </label>

        <label for="article-content">
          正文
          <textarea id="article-content" v-model="form.content" placeholder="请输入文章正文" rows="12" />
        </label>

        <div class="form-actions">
          <button class="primary-button" :disabled="loading" type="submit">
            {{ loading ? '发布中...' : '发布文章' }}
          </button>
          <RouterLink class="secondary-button" to="/">取消</RouterLink>
        </div>
      </form>
    </section>
  </main>
</template>
