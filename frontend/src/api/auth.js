const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Registration failed')
  return data
}

export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Login failed')
  return data
}