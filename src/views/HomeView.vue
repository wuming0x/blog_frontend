<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArticles } from '@/api/article'
import { useUserStore } from '@/stores/user'

const PAGE_SIZE = 10

const userStore = useUserStore()
const articles = ref([])
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const loading = ref(false)
const errorMessage = ref('')

async function loadArticles(nextPage = 0) {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await fetchArticles({ page: nextPage, size: PAGE_SIZE })
    articles.value = result.content || []
    page.value = result.page ?? nextPage
    totalPages.value = result.totalPages ?? 0
    totalElements.value = result.totalElements ?? 0
  } catch (error) {
    errorMessage.value = error.message || '文章列表加载失败'
  } finally {
    loading.value = false
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

onMounted(() => loadArticles())
</script>

<template>
  <main class="home-page">
    <section class="article-list-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Latest Articles</p>
          <h1>文章列表</h1>
          <!-- <p class="hero-copy">浏览最新发布的博客文章，点击标题查看完整内容。</p> -->
        </div>

        <RouterLink
          v-if="userStore.isLoggedIn"
          class="primary-button link-button"
          to="/articles/new"
        >
          发布文章
        </RouterLink>
      </div>

      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>
      <p v-if="loading" class="state-message">正在加载文章...</p>

      <div v-else-if="articles.length === 0 && !errorMessage" class="empty-state">
        <h2>暂无文章</h2>
        <p>第一篇文章还在路上。登录后可以发布新的内容。</p>
        <RouterLink
          v-if="userStore.isLoggedIn"
          class="primary-button link-button"
          to="/articles/new"
        >
          发布文章
        </RouterLink>
      </div>

      <div v-else class="article-list">
        <article v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-meta">
            <span>{{ article.authorUsername }}</span>
            <span>{{ formatDate(article.updatedAt || article.createdAt) }}</span>
          </div>
          <h2>
            <RouterLink :to="`/articles/${article.id}`">{{ article.title }}</RouterLink>
          </h2>
          <p>{{ article.summary }}</p>
        </article>
      </div>

      <div v-if="totalElements > 0" class="pagination-bar">
        <button
          class="secondary-button"
          :disabled="loading || page <= 0"
          type="button"
          @click="loadArticles(page - 1)"
        >
          上一页
        </button>
        <span>第 {{ page + 1 }} / {{ Math.max(totalPages, 1) }} 页，共 {{ totalElements }} 篇</span>
        <button
          class="secondary-button"
          :disabled="loading || page + 1 >= totalPages"
          type="button"
          @click="loadArticles(page + 1)"
        >
          下一页
        </button>
      </div>
    </section>
  </main>
</template>
