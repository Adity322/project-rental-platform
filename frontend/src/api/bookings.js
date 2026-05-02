const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getBookings = async (token) => {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings')
  return data
}

export const createBooking = async (bookingData, token) => {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create booking')
  return data
}

export const cancelBooking = async (id, token) => {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to cancel booking')
  return data
}

export const updateBookingStatus = async (id, status, token) => {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update booking status')
  return data
}