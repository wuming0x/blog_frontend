<script setup>
import { computed, onMounted, ref } from 'vue'
import { deleteUser, fetchUsers, updateUserRole } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const users = ref([])
const loading = ref(false)
const operatingId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const currentUserId = computed(() => userStore.user?.id)

async function loadUsers() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    users.value = await fetchUsers(userStore.user?.token)
  } catch (error) {
    errorMessage.value = error.message || '用户列表加载失败'
  } finally {
    loading.value = false
  }
}

function isCurrentUser(user) {
  return user.id === currentUserId.value
}

function canManageUser(user) {
  return !isCurrentUser(user) && operatingId.value !== user.id
}

// 管理员不能修改自己的角色，防止把自己降权后失去后台访问权限。
async function handleRoleChange(user, event) {
  const nextRole = event.target.value
  if (nextRole === user.role || isCurrentUser(user)) {
    event.target.value = user.role
    return
  }

  operatingId.value = user.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updatedUser = await updateUserRole(user.id, nextRole, userStore.user?.token)
    users.value = users.value.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    successMessage.value = `已将 ${updatedUser.username} 设置为 ${updatedUser.role}`
  } catch (error) {
    event.target.value = user.role
    errorMessage.value = error.message || '用户角色更新失败'
  } finally {
    operatingId.value = null
  }
}

// 删除前再次确认，并禁止删除当前登录管理员账号。
async function handleDelete(user) {
  if (isCurrentUser(user) || operatingId.value) {
    return
  }
  if (!window.confirm(`确认删除用户 ${user.username} 吗？删除后无法恢复。`)) {
    return
  }

  operatingId.value = user.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteUser(user.id, userStore.user?.token)
    users.value = users.value.filter((item) => item.id !== user.id)
    successMessage.value = `已删除用户 ${user.username}`
  } catch (error) {
    errorMessage.value = error.message || '用户删除失败'
  } finally {
    operatingId.value = null
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

onMounted(loadUsers)
</script>

<template>
  <main class="admin-page">
    <section class="admin-panel" aria-labelledby="user-management-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Admin</p>
          <h1 id="user-management-title">用户管理</h1>
        </div>
        <button class="secondary-button" :disabled="loading" type="button" @click="loadUsers">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>

      <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success-message">{{ successMessage }}</p>
      <p v-if="loading" class="state-message">正在加载用户...</p>

      <div v-else-if="users.length === 0 && !errorMessage" class="empty-state">
        <h2>暂无用户</h2>
        <p>当前还没有可管理的用户账号。</p>
      </div>

      <div v-else class="user-table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <span class="user-name">{{ user.username }}</span>
                <span v-if="isCurrentUser(user)" class="self-badge">当前账号</span>
              </td>
              <td>
                <select
                  class="role-select"
                  :disabled="!canManageUser(user)"
                  :value="user.role"
                  @change="handleRoleChange(user, $event)"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.updatedAt) }}</td>
              <td>
                <button
                  class="danger-button user-delete-button"
                  :disabled="!canManageUser(user)"
                  type="button"
                  @click="handleDelete(user)"
                >
                  {{ operatingId === user.id ? '处理中...' : '删除' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
