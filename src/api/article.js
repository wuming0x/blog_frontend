const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后重试'

async function request(path, options = {}) {
  let response
  const { headers: optionHeaders = {}, ...fetchOptions } = options

  try {
    response = await fetch(path, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...optionHeaders,
      },
    })
  } catch {
    throw new Error('后端服务不可用，请确认 Spring Boot 已启动')
  }

  const data = await parseJson(response)

  if (!response.ok) {
    if (!data?.message) {
      console.error(`请求失败：HTTP ${response.status}`, {
        path,
        status: response.status,
        statusText: response.statusText,
      })
    }
    throw new Error(data?.message || DEFAULT_ERROR_MESSAGE)
  }

  return data
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function fetchArticles({ page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  return request(`/api/articles?${params.toString()}`)
}

export async function fetchArticleDetail(id) {
  return request(`/api/articles/${id}`)
}

export async function createArticle(payload, token) {
  if (!token) {
    throw new Error('请先登录后再发布文章')
  }

  return request('/api/articles', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateArticle(id, payload, token) {
  if (!token) {
    throw new Error('请先登录后再编辑文章')
  }

  return request(`/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteArticle(id, token) {
  if (!token) {
    throw new Error('请先登录后再删除文章')
  }

  return request(`/api/articles/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
