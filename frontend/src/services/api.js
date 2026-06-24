const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')
const API_BASE = `${BASE_URL}/api`

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const errorMessage = data?.error || data?.detail || 'Request failed'
    throw new Error(errorMessage)
  }

  return data
}

function authHeaders(token) {
  return token ? { Authorization: `Token ${token}` } : {}
}

export async function loginRequest(payload) {
  const response = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function signupRequest(payload) {
  const response = await fetch(`${API_BASE}/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function fetchTodos(token) {
  const response = await fetch(`${API_BASE}/todos/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  })
  return handleResponse(response)
}

export async function createTodo(token, payload) {
  const response = await fetch(`${API_BASE}/todos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function updateTodo(token, id, payload) {
  const response = await fetch(`${API_BASE}/todos/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function deleteTodo(token, id) {
  const response = await fetch(`${API_BASE}/todos/${id}/`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  })
  if (!response.ok) {
    throw new Error('Unable to delete todo')
  }
  return null
}
