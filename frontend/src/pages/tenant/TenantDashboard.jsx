import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getRequests } from '../../api/requests'
import { getBookings } from '../../api/bookings'
import { getPropertyById } from '../../api/properties'
import { LogOut, Wrench, Calendar, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const statusColors = {
  pending: 'bg-[#2a1f0a] text-[#EF9F27] border-[#EF9F27]',
  'in-progress': 'bg-[#0a1f2a] text-[#5DCAA5] border-[#5DCAA5]',
  completed: 'bg-[#0f200f] text-[#97C459] border-[#97C459]',
}

const priorityColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-brand-muted',
}

export default function TenantDashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()

  const [requests, setRequests] = useState([])
  const [bookings, setBookings] = useState([])
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('requestUpdated', (updatedRequest) => {
      setRequests(prev =>
        prev.map(r => r._id === updatedRequest._id ? updatedRequest : r)
      )
    })

    socket.on('bookingCreated', (newBooking) => {
      setBookings(prev => [newBooking, ...prev])
    })

    socket.on('bookingDeleted', (deletedId) => {
      setBookings(prev => prev.filter(b => b._id !== deletedId))
    })

    socket.on('bookingUpdated', (updatedBooking) => {
      setBookings(prev =>
        prev.map(b => b._id === updatedBooking._id ? { ...b, status: updatedBooking.status } : b)
      )
    })

    return () => {
      socket.off('requestUpdated')
      socket.off('bookingCreated')
      socket.off('bookingDeleted')
      socket.off('bookingUpdated')
    }
  }, [socket])

  const fetchData = async () => {
  try {
    const [requestsData, bookingsData] = await Promise.all([
      getRequests(token),
      getBookings(token),
    ])
    setRequests(requestsData)
    setBookings(bookingsData)

    if (user?.property) {
      const propertyData = await getPropertyById(user.property, token)
      setProperty(propertyData)
    }
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const activeRequests = requests.filter(r => r.status !== 'completed')
  const upcomingBookings = bookings.filter(b => new Date(b.booking_date) >= new Date())

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader size={24} className="text-brand-teal animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Top Bar */}
      <div className="bg-brand-surface border-b border-brand-border-light px-6 py-4 flex items-center justify-between">
        <div className="font-syne font-extrabold text-lg text-white tracking-tight">
          Property<span className="text-brand-teal">Rental</span>
        </div>
        <div className="font-mono text-xs text-brand-teal">● LIVE</div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white font-medium">{user?.name}</p>
            <p className="text-xs text-brand-muted">Tenant</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-border text-brand-muted hover:text-white hover:border-brand-faint transition-colors text-sm"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-2xl text-white mb-1">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-brand-muted text-sm">Here's what's happening with your unit today.</p>
          {property && (
            <div className="flex items-center gap-2 mt-3 bg-brand-surface border border-brand-border rounded-lg px-4 py-2 w-fit">
              <span className="text-sm">🏢</span>
              <div>
                <span className="text-xs text-brand-muted">Your building — </span>
                <span className="text-xs text-white font-medium">{property.name}</span>
                <span className="text-xs text-brand-muted"> · {property.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Active requests</div>
            <div className="font-syne font-bold text-3xl text-brand-teal">{activeRequests.length}</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Upcoming bookings</div>
            <div className="font-syne font-bold text-3xl text-brand-teal">{upcomingBookings.length}</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Total requests</div>
            <div className="font-syne font-bold text-3xl text-brand-teal">{requests.length}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/tenant/requests"
            className="bg-brand-surface border border-brand-border rounded-xl p-5 flex items-center gap-4 hover:border-brand-teal transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
              <Wrench size={18} className="text-brand-teal" />
            </div>
            <div>
              <div className="font-syne font-semibold text-sm text-white group-hover:text-brand-teal transition-colors">
                Maintenance Requests
              </div>
              <div className="text-xs text-brand-muted mt-0.5">Submit or track your requests</div>
            </div>
          </Link>
          <Link
            to="/tenant/amenities"
            className="bg-brand-surface border border-brand-border rounded-xl p-5 flex items-center gap-4 hover:border-brand-teal transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1f2010] flex items-center justify-center">
              <Calendar size={18} className="text-[#97C459]" />
            </div>
            <div>
              <div className="font-syne font-semibold text-sm text-white group-hover:text-brand-teal transition-colors">
                Book Amenities
              </div>
              <div className="text-xs text-brand-muted mt-0.5">View and book shared spaces</div>
            </div>
          </Link>
        </div>

        {/* Recent Requests */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-syne font-semibold text-white text-sm">Recent Maintenance Requests</h2>
            <Link to="/tenant/requests" className="text-xs text-brand-teal hover:underline">View all</Link>
          </div>
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <AlertCircle size={24} className="text-brand-dim" />
              <p className="text-brand-muted text-sm">No requests yet</p>
              <Link to="/tenant/requests" className="text-xs text-brand-teal hover:underline">Submit your first request</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {requests.slice(0, 5).map((req, i) => (
                <div key={req._id} className={`flex items-center gap-4 py-3 ${i !== 0 ? 'border-t border-brand-border-light' : ''}`}>
                  <div className="flex-1">
                    <p className="text-sm text-white">{req.description}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {req.category} · <span className={priorityColors[req.priority?.toLowerCase()]}>{req.priority} priority</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[req.status?.toLowerCase()] || 'bg-brand-card text-brand-muted border-brand-border'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-syne font-semibold text-white text-sm">Upcoming Amenity Bookings</h2>
            <Link to="/tenant/amenities" className="text-xs text-brand-teal hover:underline">Book amenity</Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Clock size={24} className="text-brand-dim" />
              <p className="text-brand-muted text-sm">No upcoming bookings</p>
              <Link to="/tenant/amenities" className="text-xs text-brand-teal hover:underline">Book an amenity</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {upcomingBookings.slice(0, 5).map((booking, i) => (
                <div key={booking._id} className={`flex items-center gap-4 py-3 ${i !== 0 ? 'border-t border-brand-border-light' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#1f2010] flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-[#97C459]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{booking.amenity?.name || 'Amenity'}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {new Date(booking.booking_date).toLocaleDateString()} · {booking.check_in} – {booking.check_out}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    booking.status === 'approved'
                      ? 'bg-[#0f200f] text-[#97C459] border-[#97C459]'
                      : booking.status === 'rejected'
                      ? 'bg-red-900/30 text-red-400 border-red-700'
                      : 'bg-[#2a1f0a] text-[#EF9F27] border-[#EF9F27]'
                  }`}>
                    {booking.status === 'approved' ? 'Approved' : booking.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}