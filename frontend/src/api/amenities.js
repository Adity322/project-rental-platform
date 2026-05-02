const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getAmenities = async (token) => {
  const res = await fetch(`${BASE_URL}/api/amenities`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch amenities')
  return data
}

export const createAmenity = async (amenityData, token) => {
  const res = await fetch(`${BASE_URL}/api/amenities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(amenityData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create amenity')
  return data
}