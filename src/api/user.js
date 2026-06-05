const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后重试'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
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

export async function register(payload) {
  return request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
