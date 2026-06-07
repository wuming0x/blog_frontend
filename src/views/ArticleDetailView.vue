<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { deleteArticle, fetchArticleDetail } from '@/api/article'
import { createComment, deleteComment, fetchArticleComments } from '@/api/comment'
import { useUserStore } from '@/stores/user'

const COMMENT_PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref(null)
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const comments = ref([])
const commentPage = ref(0)
const commentTotalPages = ref(0)
const commentTotalElements = ref(0)
const commentsLoading = ref(false)
const commentSubmitting = ref(false)
const commentDeletingId = ref(null)
const commentErrorMessage = ref('')
const commentContent = ref('')

const canManageArticle = computed(() => {
  return userStore.isLoggedIn && article.value && (userStore.isAdmin || userStore.user.id === article.value.authorId)
})

function canDeleteComment(comment) {
  if (!userStore.isLoggedIn || !article.value) {
    return false
  }
  return userStore.isAdmin || userStore.user.id === comment.authorId || userStore.user.id === article.value.authorId
}

async function loadArticle() {
  loading.value = true
  errorMessage.value = ''

  try {
    article.value = await fetchArticleDetail(route.params.id)
    await loadComments(0)
  } catch (error) {
    errorMessage.value = error.message || '文章详情加载失败'
  } finally {
    loading.value = false
  }
}

// 加载评论列表，和文章详情分开维护错误状态，避免评论失败覆盖文章内容。
async function loadComments(nextPage = 0) {
  commentsLoading.value = true
  commentErrorMessage.value = ''

  try {
    const result = await fetchArticleComments(route.params.id, {
      page: nextPage,
      size: COMMENT_PAGE_SIZE,
    })
    comments.value = result.content || []
    commentPage.value = result.page ?? nextPage
    commentTotalPages.value = result.totalPages ?? 0
    commentTotalElements.value = result.totalElements ?? 0
  } catch (error) {
    commentErrorMessage.value = error.message || '评论加载失败'
  } finally {
    commentsLoading.value = false
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

async function handleSubmitComment() {
  const content = commentContent.value.trim()
  if (!content) {
    commentErrorMessage.value = '评论内容不能为空'
    return
  }

  commentSubmitting.value = true
  commentErrorMessage.value = ''
  try {
    await createComment(article.value.id, { content }, userStore.user?.token)
    commentContent.value = ''
    await loadComments(0)
  } catch (error) {
    commentErrorMessage.value = error.message || '评论发布失败'
  } finally {
    commentSubmitting.value = false
  }
}

async function handleDeleteComment(comment) {
  if (!canDeleteComment(comment)) {
    return
  }
  if (!window.confirm('确认删除这条评论吗？删除后无法恢复。')) {
    return
  }

  commentDeletingId.value = comment.id
  commentErrorMessage.value = ''
  try {
    await deleteComment(comment.id, userStore.user?.token)
    const shouldStepBack = comments.value.length === 1 && commentPage.value > 0
    await loadComments(shouldStepBack ? commentPage.value - 1 : commentPage.value)
  } catch (error) {
    commentErrorMessage.value = error.message || '评论删除失败'
  } finally {
    commentDeletingId.value = null
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

        <section class="comment-section">
          <div class="comment-heading">
            <div>
              <p class="eyebrow">Comments</p>
              <h2>评论区</h2>
            </div>
            <span v-if="commentTotalElements > 0" class="comment-count">共 {{ commentTotalElements }} 条</span>
          </div>

          <form v-if="userStore.isLoggedIn" class="comment-form" @submit.prevent="handleSubmitComment">
            <label for="comment-content">发表评论</label>
            <textarea
              id="comment-content"
              v-model="commentContent"
              maxlength="1000"
              placeholder="写下你的想法..."
            ></textarea>
            <div class="comment-form-actions">
              <span>{{ commentContent.trim().length }} / 1000</span>
              <button class="primary-button" :disabled="commentSubmitting" type="submit">
                {{ commentSubmitting ? '发布中...' : '发表评论' }}
              </button>
            </div>
          </form>

          <div v-else class="comment-login-tip">
            <span>登录后可以参与评论。</span>
            <RouterLink class="secondary-button" :to="{ path: '/login', query: { redirect: route.fullPath } }">
              去登录
            </RouterLink>
          </div>

          <p v-if="commentErrorMessage" class="message error-message">{{ commentErrorMessage }}</p>
          <p v-if="commentsLoading" class="state-message">正在加载评论...</p>

          <div v-else-if="comments.length === 0 && !commentErrorMessage" class="empty-state comment-empty">
            <h2>暂无评论</h2>
            <p>成为第一个留下想法的人。</p>
          </div>

          <div v-else class="comment-list">
            <article v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-meta">
                <div>
                  <strong>{{ comment.authorUsername }}</strong>
                  <span>{{ formatDate(comment.updatedAt || comment.createdAt) }}</span>
                </div>
                <button
                  v-if="canDeleteComment(comment)"
                  class="text-button comment-delete-button"
                  :disabled="commentDeletingId === comment.id"
                  type="button"
                  @click="handleDeleteComment(comment)"
                >
                  {{ commentDeletingId === comment.id ? '删除中...' : '删除' }}
                </button>
              </div>
              <p>{{ comment.content }}</p>
            </article>
          </div>

          <div v-if="commentTotalElements > 0" class="pagination-bar comment-pagination">
            <button
              class="secondary-button"
              :disabled="commentsLoading || commentPage <= 0"
              type="button"
              @click="loadComments(commentPage - 1)"
            >
              上一页
            </button>
            <span>第 {{ commentPage + 1 }} / {{ Math.max(commentTotalPages, 1) }} 页</span>
            <button
              class="secondary-button"
              :disabled="commentsLoading || commentPage + 1 >= commentTotalPages"
              type="button"
              @click="loadComments(commentPage + 1)"
            >
              下一页
            </button>
          </div>
        </section>
      </article>
    </section>
  </main>
</template>
