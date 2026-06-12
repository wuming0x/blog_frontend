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

export async function fetchUsers(token) {
  if (!token) {
    throw new Error('请先登录管理员账号')
  }

  return request('/api/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateUserRole(id, role, token) {
  if (!token) {
    throw new Error('请先登录管理员账号')
  }

  return request(`/api/users/${id}/role`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  })
}

export async function deleteUser(id, token) {
  if (!token) {
    throw new Error('请先登录管理员账号')
  }

  return request(`/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
