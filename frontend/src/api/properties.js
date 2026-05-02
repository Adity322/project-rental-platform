const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getProperties = async (token) => {
  const res = await fetch(`${BASE_URL}/api/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch properties')
  return data
}

export const createProperty = async (propertyData, token) => {
  const res = await fetch(`${BASE_URL}/api/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create property')
  return data
}
export const getPropertyById = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/properties/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch property')
  return data
}