import { useSocket } from '../../context/SocketContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRequests, updateRequestStatus } from '../../api/requests'
import { getAmenities, createAmenity } from '../../api/amenities'
import { getBookings, updateBookingStatus } from '../../api/bookings'
import { getProperties, createProperty } from '../../api/properties'
import { LogOut, Plus, X, Loader, AlertCircle, CheckCircle, XCircle, ChevronRight, TrendingUp, Clock, CheckSquare, ShieldCheck, Star } from 'lucide-react'

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

const bookingStatusColors = {
  pending: 'bg-[#2a1f0a] text-[#EF9F27] border-[#EF9F27]',
  approved: 'bg-[#0f200f] text-[#97C459] border-[#97C459]',
  rejected: 'bg-red-900/30 text-red-400 border-red-700',
}

const tabs = ['Requests', 'Amenities', 'Bookings', 'Properties']

export default function OwnerDashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [activeTab, setActiveTab] = useState('Requests')
  const [requests, setRequests] = useState([])
  const [amenities, setAmenities] = useState([])
  const [bookings, setBookings] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAmenityModal, setShowAmenityModal] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [updatingBooking, setUpdatingBooking] = useState(null)

  const [amenityForm, setAmenityForm] = useState({
    name: '',
    propertyId: '',
    availability_status: 'available',
  })

  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
  })

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    if (user.role !== 'owner') {
      navigate('/tenant/dashboard')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsData, amenitiesData, bookingsData, propertiesData] = await Promise.all([
        getRequests(token),
        getAmenities(token),
        getBookings(token),
        getProperties(token),
      ])
      setRequests(requestsData)
      setAmenities(amenitiesData)
      setBookings(bookingsData)
      setProperties(propertiesData)

      if (propertiesData.length === 0) {
        setShowOnboarding(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await updateRequestStatus(id, newStatus, token)
      setRequests(requests.map(r =>
        r._id === id ? { ...r, status: updated.status || newStatus } : r
      ))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleBookingStatusUpdate = async (id, newStatus) => {
    setUpdatingBooking(id)
    try {
      await updateBookingStatus(id, newStatus, token)
      setBookings(bookings.map(b =>
        b._id === id ? { ...b, status: newStatus } : b
      ))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingBooking(null)
    }
  }

  const handleCreateAmenity = async (e) => {
    e.preventDefault()
    if (!amenityForm.propertyId) {
      setFormError('Please select a property')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const newAmenity = await createAmenity({
        name: amenityForm.name,
        propertyId: amenityForm.propertyId,
      }, token)
      setAmenities([...amenities, newAmenity])
      setShowAmenityModal(false)
      setAmenityForm({ name: '', propertyId: '', availability_status: 'available' })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateProperty = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const newProperty = await createProperty(propertyForm, token)
      setProperties([...properties, newProperty])
      setShowPropertyModal(false)
      setShowOnboarding(false)
      setPropertyForm({ name: '', address: '' })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!socket) return

    socket.on('requestCreated', (newRequest) => {
      setRequests(prev => [newRequest, ...prev])
    })
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

    return () => {
      socket.off('requestCreated')
      socket.off('requestUpdated')
      socket.off('bookingCreated')
      socket.off('bookingDeleted')
    }
  }, [socket])

  // ── Feature #3: KPI Calculations ──

  const completedRequests = requests.filter(r => r.status === 'completed')
  const totalRequests = requests.length

  // Completion Rate: completed / total * 100
  const completionRate = totalRequests === 0
    ? null
    : Math.round((completedRequests.length / totalRequests) * 100)

  // Avg Resolution Time: avg hours from createdAt → resolved_at on completed requests
  const avgResolutionHours = (() => {
    const resolved = completedRequests.filter(r => r.resolved_at || r.updatedAt)
    if (resolved.length === 0) return null
    const totalHours = resolved.reduce((sum, r) => {
      const created = new Date(r.createdAt)
      const resolvedAt = new Date(r.resolved_at || r.updatedAt)
      const diffHours = (resolvedAt - created) / (1000 * 60 * 60)
      return sum + diffHours
    }, 0)
    return Math.round(totalHours / resolved.length)
  })()

  // Booking conflicts: always 0 — backend prevents them
  const bookingConflicts = 0

  // KPI status helpers
  const getResolutionStatus = (hours) => {
    if (hours === null) return { color: 'text-brand-muted', label: 'No data yet', met: null }
    if (hours <= 48) return { color: 'text-[#97C459]', label: `${hours}h avg`, met: true }
    return { color: 'text-red-400', label: `${hours}h avg`, met: false }
  }

  const getCompletionStatus = (rate) => {
    if (rate === null) return { color: 'text-brand-muted', label: 'No data yet', met: null }
    if (rate >= 90) return { color: 'text-[#97C459]', label: `${rate}%`, met: true }
    if (rate >= 70) return { color: 'text-[#EF9F27]', label: `${rate}%`, met: false }
    return { color: 'text-red-400', label: `${rate}%`, met: false }
  }

  const resolutionStatus = getResolutionStatus(avgResolutionHours)
  const completionStatus = getCompletionStatus(completionRate)

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
            <p className="text-xs text-[#97C459]">Property Owner</p>
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
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-brand-muted text-sm">Manage your properties, requests and amenities.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ONBOARDING BANNER */}
        {showOnboarding && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-syne font-bold text-gray-900 text-lg">
                  👋 Let's get you set up
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Follow these 3 steps to start managing your building
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Step 1 */}
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-brand-teal text-brand-teal-dark flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </div>
                  <span className="font-syne font-semibold text-gray-900 text-sm">Create a property</span>
                </div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                  Add your building or apartment complex. This is the foundation of your account.
                </p>
                <button
                  onClick={() => {
                    setFormError('')
                    setShowPropertyModal(true)
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline font-medium"
                >
                  Add property <ChevronRight size={12} />
                </button>
              </div>

              {/* Step 2 */}
              <div className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 ${properties.length === 0 ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-mono text-xs">
                    2
                  </div>
                  <span className="font-syne font-semibold text-gray-900 text-sm">Add amenities</span>
                </div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                  Add shared spaces like gym, pool, parking to your property.
                </p>
                <button
                  disabled={properties.length === 0}
                  onClick={() => {
                    setFormError('')
                    setActiveTab('Amenities')
                    setShowOnboarding(false)
                    setShowAmenityModal(true)
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add amenity <ChevronRight size={12} />
                </button>
              </div>

              {/* Step 3 */}
              <div className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 ${properties.length === 0 ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-mono text-xs">
                    3
                  </div>
                  <span className="font-syne font-semibold text-gray-900 text-sm">Share Property ID</span>
                </div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                  Share your Property ID with tenants so they can register and join your building.
                </p>
                <button
                  disabled={properties.length === 0}
                  onClick={() => {
                    setActiveTab('Properties')
                    setShowOnboarding(false)
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  View Property ID <ChevronRight size={12} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Total Requests</div>
            <div className="font-syne font-bold text-3xl text-brand-teal">{requests.length}</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Pending</div>
            <div className="font-syne font-bold text-3xl text-[#EF9F27]">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Amenities</div>
            <div className="font-syne font-bold text-3xl text-brand-teal">{amenities.length}</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
            <div className="text-brand-muted text-xs mb-2">Booking Requests</div>
            <div className="font-syne font-bold text-3xl text-[#EF9F27]">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* ── Feature #3: KPI Metrics ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-brand-teal" />
            <h2 className="font-syne font-semibold text-white text-sm">KPI Metrics</h2>
            <span className="text-xs text-brand-dim ml-1">— Performance against targets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

            {/* KPI 1 — Maintenance Resolution Time */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                  <Clock size={15} className="text-brand-teal" />
                </div>
                {resolutionStatus.met === true && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f200f] text-[#97C459] border border-[#97C459]">On Track</span>
                )}
                {resolutionStatus.met === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700">Off Track</span>
                )}
                {resolutionStatus.met === null && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-card text-brand-dim border border-brand-border">—</span>
                )}
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-1">Resolution Time</p>
                <p className={`font-syne font-bold text-2xl ${resolutionStatus.color}`}>
                  {resolutionStatus.label}
                </p>
              </div>
              <div className="border-t border-brand-border-light pt-2">
                <p className="text-xs text-brand-dim">Target: <span className="text-brand-muted">≤ 48h</span></p>
                <p className="text-xs text-brand-dim mt-0.5">
                  Based on {completedRequests.length} completed request{completedRequests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* KPI 2 — Request Completion Rate */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                  <CheckSquare size={15} className="text-brand-teal" />
                </div>
                {completionStatus.met === true && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f200f] text-[#97C459] border border-[#97C459]">On Track</span>
                )}
                {completionStatus.met === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a1f0a] text-[#EF9F27] border border-[#EF9F27]">Needs Work</span>
                )}
                {completionStatus.met === null && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-card text-brand-dim border border-brand-border">—</span>
                )}
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-1">Completion Rate</p>
                <p className={`font-syne font-bold text-2xl ${completionStatus.color}`}>
                  {completionStatus.label}
                </p>
              </div>
              <div className="border-t border-brand-border-light pt-2">
                <p className="text-xs text-brand-dim">Target: <span className="text-brand-muted">≥ 90%</span></p>
                <p className="text-xs text-brand-dim mt-0.5">
                  {completedRequests.length} of {totalRequests} request{totalRequests !== 1 ? 's' : ''} resolved
                </p>
              </div>
            </div>

            {/* KPI 3 — Booking Conflicts */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                  <ShieldCheck size={15} className="text-brand-teal" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f200f] text-[#97C459] border border-[#97C459]">On Track</span>
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-1">Booking Conflicts</p>
                <p className="font-syne font-bold text-2xl text-[#97C459]">
                  {bookingConflicts}
                </p>
              </div>
              <div className="border-t border-brand-border-light pt-2">
                <p className="text-xs text-brand-dim">Target: <span className="text-brand-muted">0 conflicts</span></p>
                <p className="text-xs text-brand-dim mt-0.5">System prevents double-bookings</p>
              </div>
            </div>

            {/* KPI 4 — System Response Time (static) */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                  <TrendingUp size={15} className="text-brand-teal" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-card text-brand-dim border border-brand-border">Target</span>
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-1">Response Time</p>
                <p className="font-syne font-bold text-2xl text-brand-teal">≤ 2s</p>
              </div>
              <div className="border-t border-brand-border-light pt-2">
                <p className="text-xs text-brand-dim">Target: <span className="text-brand-muted">≤ 2 seconds</span></p>
                <p className="text-xs text-brand-dim mt-0.5">Measured per API endpoint</p>
              </div>
            </div>

            {/* KPI 5 — User Satisfaction (static) */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                  <Star size={15} className="text-brand-teal" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-card text-brand-dim border border-brand-border">Target</span>
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-1">Satisfaction Score</p>
                <p className="font-syne font-bold text-2xl text-brand-teal">4 / 5</p>
              </div>
              <div className="border-t border-brand-border-light pt-2">
                <p className="text-xs text-brand-dim">Target: <span className="text-brand-muted">≥ 4 out of 5</span></p>
                <p className="text-xs text-brand-dim mt-0.5">Via post-session feedback</p>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-brand-border-light">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px relative ${
                activeTab === tab
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              {tab}
              {tab === 'Bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF9F27] text-black text-xs flex items-center justify-center font-bold">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* REQUESTS TAB */}
        {activeTab === 'Requests' && (
          <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-brand-border-light">
              <div className="col-span-4 text-xs text-brand-dim uppercase tracking-wider font-medium">Description</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Category</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Priority</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Tenant</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Status</div>
            </div>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle size={28} className="text-brand-dim" />
                <p className="text-brand-muted text-sm">No requests yet</p>
              </div>
            ) : (
              requests.map((req, i) => (
                <div
                  key={req._id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-card transition-colors ${i !== 0 ? 'border-t border-brand-border-light' : ''}`}
                >
                  <div className="col-span-4">
                    <p className="text-sm text-white">{req.description}</p>
                    <p className="text-xs text-brand-dim mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-brand-muted capitalize">{req.category}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs font-medium capitalize ${priorityColors[req.priority?.toLowerCase()]}`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-brand-muted">
                      {req.tenant?.name || 'Tenant'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border font-medium bg-transparent cursor-pointer focus:outline-none ${statusColors[req.status?.toLowerCase()] || 'text-brand-muted border-brand-border'}`}
                    >
                      <option value="pending">pending</option>
                      <option value="in-progress">in-progress</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* AMENITIES TAB */}
        {activeTab === 'Amenities' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setFormError('')
                  setShowAmenityModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Add Amenity
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenities.length === 0 ? (
                <div className="col-span-3 bg-brand-surface border border-brand-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
                  <AlertCircle size={28} className="text-brand-dim" />
                  <p className="text-brand-muted text-sm">No amenities added yet</p>
                  {properties.length === 0 && (
                    <p className="text-brand-dim text-xs">Add a property first before adding amenities</p>
                  )}
                </div>
              ) : (
                amenities.map(amenity => (
                  <div key={amenity._id} className="bg-brand-surface border border-brand-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-syne font-semibold text-white text-sm">{amenity.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                        amenity.availability_status === 'available'
                          ? 'bg-[#0f200f] text-[#97C459] border-[#97C459]'
                          : 'bg-[#1f1020] text-[#ED93B1] border-[#ED93B1]'
                      }`}>
                        {amenity.availability_status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted">
                      {amenity.property?.name || 'Property'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'Bookings' && (
          <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-brand-border-light">
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Amenity</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Tenant</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Date</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Check-in</div>
              <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Check-out</div>
              <div className="col-span-1 text-xs text-brand-dim uppercase tracking-wider font-medium">Status</div>
              <div className="col-span-1 text-xs text-brand-dim uppercase tracking-wider font-medium">Action</div>
            </div>
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle size={28} className="text-brand-dim" />
                <p className="text-brand-muted text-sm">No booking requests yet</p>
              </div>
            ) : (
              bookings.map((booking, i) => (
                <div
                  key={booking._id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-card transition-colors ${i !== 0 ? 'border-t border-brand-border-light' : ''}`}
                >
                  <div className="col-span-2">
                    <p className="text-sm text-white">{booking.amenity?.name || 'Amenity'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-brand-muted">{booking.tenant?.name || 'Tenant'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-brand-muted">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-brand-muted">{booking.check_in}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-brand-muted">{booking.check_out}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${bookingStatusColors[booking.status] || 'bg-brand-card text-brand-muted border-brand-border'}`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                  <div className="col-span-1">
                    {booking.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {updatingBooking === booking._id ? (
                          <Loader size={14} className="text-brand-teal animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'approved')}
                              className="text-[#97C459] hover:opacity-70 transition-opacity"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleBookingStatusUpdate(booking._id, 'rejected')}
                              className="text-red-400 hover:opacity-70 transition-opacity"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {booking.status === 'approved' && (
                      <span className="text-xs text-brand-dim">Approved</span>
                    )}
                    {booking.status === 'rejected' && (
                      <span className="text-xs text-brand-dim">Rejected</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'Properties' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setFormError('')
                  setShowPropertyModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Add Property
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.length === 0 ? (
                <div className="col-span-3 bg-brand-surface border border-brand-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
                  <AlertCircle size={28} className="text-brand-dim" />
                  <p className="text-brand-muted text-sm">No properties added yet</p>
                  <button
                    onClick={() => {
                      setFormError('')
                      setShowPropertyModal(true)
                    }}
                    className="text-xs text-brand-teal hover:underline"
                  >
                    Add your first property
                  </button>
                </div>
              ) : (
                properties.map(property => (
                  <div key={property._id} className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-teal transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#1f2010] flex items-center justify-center mb-3">
                      <span className="text-[#97C459] text-sm">🏢</span>
                    </div>
                    <h3 className="font-syne font-semibold text-white text-sm mb-1">{property.name}</h3>
                    <p className="text-xs text-brand-muted mb-3">{property.address}</p>
                    <div className="bg-brand-card border border-brand-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-brand-dim truncate">{property._id}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(property._id)
                          alert('Property ID copied!')
                        }}
                        className="text-xs text-brand-teal hover:underline flex-shrink-0"
                      >
                        Copy ID
                      </button>
                    </div>
                    <p className="text-xs text-brand-dim mt-2">Share this ID with your tenants</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </div>

      {/* Add Amenity Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-lg text-white">Add Amenity</h2>
              <button onClick={() => setShowAmenityModal(false)} className="text-brand-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            <form onSubmit={handleCreateAmenity} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Property</label>
                {properties.length === 0 ? (
                  <div className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-dim">
                    No properties yet — add a property first
                  </div>
                ) : (
                  <select
                    value={amenityForm.propertyId}
                    onChange={(e) => setAmenityForm({ ...amenityForm, propertyId: e.target.value })}
                    className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-colors"
                    required
                  >
                    <option value="">Select a property</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Amenity Name</label>
                <input
                  type="text"
                  value={amenityForm.name}
                  onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })}
                  placeholder="e.g. Swimming Pool"
                  required
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || properties.length === 0}
                className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? <><Loader size={16} className="animate-spin" /> Adding...</> : 'Add Amenity'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-lg text-white">Add Property</h2>
              <button onClick={() => setShowPropertyModal(false)} className="text-brand-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            <form onSubmit={handleCreateProperty} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Property Name</label>
                <input
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  placeholder="e.g. Sunset Apartments"
                  required
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Address</label>
                <input
                  type="text"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  placeholder="e.g. 123 Main Street, Mumbai"
                  required
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? <><Loader size={16} className="animate-spin" /> Adding...</> : 'Add Property'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
