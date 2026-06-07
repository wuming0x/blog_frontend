<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchArticleDetail, updateArticle } from '@/api/article'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref(null)
const form = reactive({
  title: '',
  summary: '',
  content: '',
})
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const canEdit = computed(() => {
  return userStore.isLoggedIn && article.value && userStore.user.id === article.value.authorId
})

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''

  try {
    article.value = await fetchArticleDetail(route.params.id)
    form.title = article.value.title || ''
    form.summary = article.value.summary || ''
    form.content = article.value.content || ''
  } catch (error) {
    errorMessage.value = error.message || '文章详情加载失败'
  } finally {
    loading.value = false
  }
}

async function submitUpdate() {
  errorMessage.value = ''

  if (!canEdit.value) {
    errorMessage.value = '无权操作该文章'
    return
  }
  if (!form.title.trim()) {
    errorMessage.value = '标题不能为空'
    return
  }
  if (!form.content.trim()) {
    errorMessage.value = '正文不能为空'
    return
  }

  saving.value = true
  try {
    const updatedArticle = await updateArticle(
      route.params.id,
      {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
      },
      userStore.user?.token,
    )
    await router.push(`/articles/${updatedArticle.id}`)
  } catch (error) {
    errorMessage.value = error.message || '文章保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadArticle)
</script>

<template>
  <main class="editor-page">
    <section class="editor-panel" aria-labelledby="edit-article-title">
      <RouterLink class="back-link" :to="`/articles/${route.params.id}`">返回文章详情</RouterLink>

      <div class="section-heading">
        <div>
          <p class="eyebrow">Edit Article</p>
          <h1 id="edit-article-title">编辑文章</h1>
          <p class="hero-copy">仅文章作者可以修改标题、摘要和正文。</p>
        </div>
      </div>

      <p v-if="loading" class="state-message">正在加载文章...</p>
      <p v-else-if="errorMessage" class="message error-message">{{ errorMessage }}</p>
      <p v-if="article && !canEdit" class="message error-message">无权操作该文章</p>

      <form v-if="article && canEdit" class="article-form" @submit.prevent="submitUpdate">
        <label for="edit-article-title-input">
          标题
          <input id="edit-article-title-input" v-model="form.title" placeholder="请输入文章标题" type="text" />
        </label>

        <label for="edit-article-summary">
          摘要
          <input id="edit-article-summary" v-model="form.summary" placeholder="可选，留空自动生成" type="text" />
        </label>

        <label for="edit-article-content">
          正文
          <textarea id="edit-article-content" v-model="form.content" placeholder="请输入文章正文" rows="12" />
        </label>

        <div class="form-actions">
          <button class="primary-button" :disabled="saving" type="submit">
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
          <RouterLink class="secondary-button" :to="`/articles/${route.params.id}`">取消</RouterLink>
        </div>
      </form>
    </section>
  </main>
</template>
