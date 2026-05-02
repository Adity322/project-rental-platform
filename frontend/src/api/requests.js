const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getRequests = async (token) => {
  const res = await fetch(`${BASE_URL}/api/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch requests')
  return data
}

export const createRequest = async (requestData, token) => {
  const res = await fetch(`${BASE_URL}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create request')
  return data
}

export const updateRequestStatus = async (id, status, token) => {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update request')
  return data
}