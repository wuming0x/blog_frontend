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

/**
 * 分页查询指定文章下的评论。
 */
export async function fetchArticleComments(articleId, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  return request(`/api/articles/${articleId}/comments?${params.toString()}`)
}

/**
 * 发布评论，必须传入登录 token。
 */
export async function createComment(articleId, payload, token) {
  if (!token) {
    throw new Error('请先登录后再发表评论')
  }

  return request(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

/**
 * 删除评论，必须传入登录 token。
 */
export async function deleteComment(commentId, token) {
  if (!token) {
    throw new Error('请先登录后再删除评论')
  }

  return request(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
