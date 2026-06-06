<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { deleteArticle, fetchArticleDetail } from '@/api/article'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const canManageArticle = computed(() => {
  return userStore.isLoggedIn && article.value && userStore.user.id === article.value.authorId
})

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''

  try {
    article.value = await fetchArticleDetail(route.params.id)
  } catch (error) {
    errorMessage.value = error.message || '文章详情加载失败'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!article.value || !canManageArticle.value) {
    return
  }
  if (!window.confirm('确认删除这篇文章吗？删除后无法恢复。')) {
    return
  }

  deleting.value = true
  errorMessage.value = ''
  try {
    await deleteArticle(article.value.id, userStore.user?.token)
    await router.push('/')
  } catch (error) {
    errorMessage.value = error.message || '文章删除失败'
  } finally {
    deleting.value = false
  }
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

onMounted(loadArticle)
</script>

<template>
  <main class="detail-page">
    <section class="article-detail">
      <RouterLink class="back-link" to="/">返回文章列表</RouterLink>

      <p v-if="loading" class="state-message">正在加载文章...</p>
      <p v-else-if="errorMessage" class="message error-message">{{ errorMessage }}</p>

      <article v-else-if="article">
        <p class="eyebrow">Article Detail</p>
        <div class="detail-title-row">
          <h1>{{ article.title }}</h1>
          <div v-if="canManageArticle" class="article-actions">
            <RouterLink class="secondary-button" :to="`/articles/${article.id}/edit`">编辑</RouterLink>
            <button class="danger-button" :disabled="deleting" type="button" @click="handleDelete">
              {{ deleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
        <div class="article-meta detail-meta">
          <span>{{ article.authorUsername }}</span>
          <span>{{ formatDate(article.updatedAt || article.createdAt) }}</span>
        </div>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-content">{{ article.content }}</div>
      </article>
    </section>
  </main>
</template>
