import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getAmenities } from '../../api/amenities'
import { getBookings, createBooking, cancelBooking } from '../../api/bookings'
import { ArrowLeft, X, Loader, AlertCircle, Calendar, Trash2 } from 'lucide-react'

export default function Amenities() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()

  const [amenities, setAmenities] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [formData, setFormData] = useState({
    booking_date: '',
    check_in: '',
    check_out: '',
  })

  // Feature #1 — Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Feature #2 — Calendar / List toggle state
  const [bookingView, setBookingView] = useState('list')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null)

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('bookingUpdated', (updatedBooking) => {
      setBookings(prev =>
        prev.map(b => b._id === updatedBooking._id ? { ...b, status: updatedBooking.status } : b)
      )
    })
    socket.on('bookingDeleted', (deletedId) => {
      setBookings(prev => prev.filter(b => b._id !== deletedId))
    })
    return () => {
      socket.off('bookingUpdated')
      socket.off('bookingDeleted')
    }
  }, [socket])

  const fetchData = async () => {
    try {
      const [amenitiesData, bookingsData] = await Promise.all([
        getAmenities(token),
        getBookings(token),
      ])
      setAmenities(amenitiesData)
      setBookings(bookingsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (amenity) => {
    setSelectedAmenity(amenity)
    setFormData({ booking_date: '', check_in: '', check_out: '' })
    setFormError('')
    setShowModal(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormError('')
  }

  // Feature #1 — Updated handleSubmit with confirmation modal
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const newBooking = await createBooking({
        amenityId: selectedAmenity._id,
        booking_date: formData.booking_date,
        check_in: formData.check_in,
        check_out: formData.check_out,
      }, token)

      setBookings([newBooking, ...bookings])
      setShowModal(false)

      // Show confirmation with booking details
      setConfirmedBooking({
        amenityName: selectedAmenity.name,
        date: new Date(formData.booking_date).toLocaleDateString('en-US', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        }),
        checkIn: formData.check_in,
        checkOut: formData.check_out,
      })
      setShowConfirmation(true)

    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId, token)
      setBookings(bookings.filter(b => b._id !== bookingId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const today = new Date().toISOString().split('T')[0]

  const getBookingStatusStyle = (status) => {
    if (status === 'approved') return 'bg-[#0f200f] text-[#97C459] border-[#97C459]'
    if (status === 'rejected') return 'bg-red-900/30 text-red-400 border-red-700'
    return 'bg-[#2a1f0a] text-[#EF9F27] border-[#EF9F27]'
  }

  const getBookingStatusLabel = (status) => {
    if (status === 'approved') return 'Approved'
    if (status === 'rejected') return 'Rejected'
    return 'Pending'
  }

  // ── Feature #2 — Calendar helpers ──

  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = new Date(booking.booking_date).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(booking)
    return acc
  }, {})

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const monthDays = getMonthDays(calendarDate.getFullYear(), calendarDate.getMonth())
  const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
    setSelectedCalendarDay(null)
  }

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
    setSelectedCalendarDay(null)
  }

  const getBookingsForDay = (day) => {
    if (!day) return []
    const key = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).toDateString()
    return bookingsByDate[key] || []
  }

  const groupedBookings = bookings.reduce((acc, booking) => {
    const dateKey = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(booking)
    return acc
  }, {})

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
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/tenant/dashboard"
            className="flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div>
            <h1 className="font-syne font-bold text-2xl text-white">Amenities</h1>
            <p className="text-brand-muted text-sm mt-0.5">Browse and book shared spaces in your building</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Amenities Grid */}
        <h2 className="font-syne font-semibold text-white text-sm mb-4">Available Amenities</h2>
        {amenities.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border rounded-xl flex flex-col items-center justify-center py-16 gap-3 mb-8">
            <AlertCircle size={28} className="text-brand-dim" />
            <p className="text-brand-muted text-sm">No amenities available yet</p>
            <p className="text-brand-dim text-xs">Ask your property owner to add amenities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {amenities.map(amenity => (
              <div
                key={amenity._id}
                className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col gap-4 hover:border-brand-teal transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#0a1f2a] flex items-center justify-center">
                    <Calendar size={18} className="text-brand-teal" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    amenity.availability_status === 'available'
                      ? 'bg-[#0f200f] text-[#97C459] border-[#97C459]'
                      : 'bg-[#1f1020] text-[#ED93B1] border-[#ED93B1]'
                  }`}>
                    {amenity.availability_status}
                  </span>
                </div>
                <div>
                  <h3 className="font-syne font-semibold text-white text-sm">{amenity.name}</h3>
                  {amenity.description && (
                    <p className="text-brand-muted text-xs mt-1">{amenity.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleBookClick(amenity)}
                  disabled={amenity.availability_status === 'booked'}
                  className="w-full py-2.5 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {amenity.availability_status === 'booked' ? 'Currently Booked' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── My Bookings — with List / Calendar toggle ── */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">

          {/* Header with toggle */}
          <div className="px-6 py-4 border-b border-brand-border-light flex items-center justify-between">
            <h2 className="font-syne font-semibold text-white text-sm">My Bookings</h2>
            <div className="flex items-center gap-1 bg-brand-card border border-brand-border rounded-lg p-1">
              <button
                onClick={() => setBookingView('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  bookingView === 'list'
                    ? 'bg-brand-teal text-brand-teal-dark'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setBookingView('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  bookingView === 'calendar'
                    ? 'bg-brand-teal text-brand-teal-dark'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          {/* ── LIST VIEW ── */}
          {bookingView === 'list' && (
            <>
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Calendar size={24} className="text-brand-dim" />
                  <p className="text-brand-muted text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-brand-border-light">
                  {Object.entries(groupedBookings).map(([date, dayBookings]) => (
                    <div key={date}>
                      {/* Date group header */}
                      <div className="px-6 py-2 bg-brand-card">
                        <p className="text-xs text-brand-teal font-medium">{date}</p>
                      </div>
                      {/* Bookings under this date */}
                      {dayBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-brand-card transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#0a1f2a] flex items-center justify-center flex-shrink-0">
                            <Calendar size={14} className="text-brand-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">
                              {booking.amenity?.name || 'Amenity'}
                            </p>
                            <p className="text-xs text-brand-muted mt-0.5">
                              {booking.check_in} – {booking.check_out}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getBookingStatusStyle(booking.status)}`}>
                            {getBookingStatusLabel(booking.status)}
                          </span>
                          {booking.status !== 'approved' && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="text-brand-dim hover:text-red-400 transition-colors ml-2"
                              title="Cancel booking"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── CALENDAR VIEW ── */}
          {bookingView === 'calendar' && (
            <div className="p-6">

              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="text-brand-muted hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-brand-card text-lg leading-none"
                >
                  ‹
                </button>
                <p className="font-syne font-semibold text-white text-sm">{monthName}</p>
                <button
                  onClick={nextMonth}
                  className="text-brand-muted hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-brand-card text-lg leading-none"
                >
                  ›
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-xs text-brand-dim py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {monthDays.map((day, idx) => {
                  const dayBookings = getBookingsForDay(day)
                  const hasBookings = dayBookings.length > 0
                  const isSelected = selectedCalendarDay === day
                  const isToday =
                    day === new Date().getDate() &&
                    calendarDate.getMonth() === new Date().getMonth() &&
                    calendarDate.getFullYear() === new Date().getFullYear()

                  return (
                    <button
                      key={idx}
                      onClick={() => day && setSelectedCalendarDay(isSelected ? null : day)}
                      disabled={!day}
                      className={`
                        relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-colors
                        ${!day ? 'invisible' : ''}
                        ${isSelected ? 'bg-brand-teal text-brand-teal-dark' : ''}
                        ${!isSelected && isToday ? 'border border-brand-teal text-brand-teal' : ''}
                        ${!isSelected && !isToday && hasBookings ? 'bg-brand-card text-white hover:bg-brand-teal/20' : ''}
                        ${!isSelected && !isToday && !hasBookings ? 'text-brand-muted hover:bg-brand-card' : ''}
                      `}
                    >
                      {day}
                      {hasBookings && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected day bookings */}
              {selectedCalendarDay && (
                <div className="border-t border-brand-border-light pt-4">
                  <p className="text-xs text-brand-teal font-medium mb-3">
                    {new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedCalendarDay)
                      .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  {getBookingsForDay(selectedCalendarDay).length === 0 ? (
                    <p className="text-brand-muted text-xs text-center py-4">No bookings on this day</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {getBookingsForDay(selectedCalendarDay).map(booking => (
                        <div
                          key={booking._id}
                          className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl px-4 py-3"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#0a1f2a] flex items-center justify-center flex-shrink-0">
                            <Calendar size={12} className="text-brand-teal" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-white font-medium">{booking.amenity?.name || 'Amenity'}</p>
                            <p className="text-xs text-brand-muted mt-0.5">{booking.check_in} – {booking.check_out}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getBookingStatusStyle(booking.status)}`}>
                            {getBookingStatusLabel(booking.status)}
                          </span>
                          {booking.status !== 'approved' && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="text-brand-dim hover:text-red-400 transition-colors"
                              title="Cancel booking"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-brand-border-light">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-teal inline-block" />
                  <span className="text-xs text-brand-muted">Has bookings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-transparent inline-block border border-brand-teal" />
                  <span className="text-xs text-brand-muted">Today</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── Booking Form Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-syne font-bold text-lg text-white">Book Amenity</h2>
                <p className="text-brand-teal text-xs mt-0.5">{selectedAmenity?.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {formError && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Booking Date</label>
                <input
                  type="date"
                  name="booking_date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-brand-muted font-medium">Check-in Time</label>
                  <input
                    type="time"
                    name="check_in"
                    value={formData.check_in}
                    onChange={handleChange}
                    required
                    className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-brand-muted font-medium">Check-out Time</label>
                  <input
                    type="time"
                    name="check_out"
                    value={formData.check_out}
                    onChange={handleChange}
                    required
                    className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <><Loader size={16} className="animate-spin" /> Booking...</>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Booking Confirmation Modal (Feature #1) ── */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md">

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#2a1f0a] border border-[#EF9F27] flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>

            {/* Heading */}
            <h2 className="font-syne font-bold text-lg text-white text-center mb-1">
              Booking Submitted!
            </h2>
            <p className="text-brand-muted text-sm text-center mb-4">
              Your request has been sent to the property owner for approval.
            </p>

            {/* Pending Badge */}
            <div className="flex justify-center mb-5">
              <span className="text-xs px-3 py-1 rounded-full border font-medium bg-[#2a1f0a] text-[#EF9F27] border-[#EF9F27]">
                Pending Owner Approval
              </span>
            </div>

            {/* Booking Summary */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col gap-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-brand-muted">Amenity</span>
                <span className="text-xs text-white font-medium">{confirmedBooking?.amenityName}</span>
              </div>
              <div className="border-t border-brand-border-light" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-brand-muted">Date</span>
                <span className="text-xs text-white font-medium">{confirmedBooking?.date}</span>
              </div>
              <div className="border-t border-brand-border-light" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-brand-muted">Check-in</span>
                <span className="text-xs text-white font-medium">{confirmedBooking?.checkIn}</span>
              </div>
              <div className="border-t border-brand-border-light" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-brand-muted">Check-out</span>
                <span className="text-xs text-white font-medium">{confirmedBooking?.checkOut}</span>
              </div>
            </div>

            {/* Info note */}
            <p className="text-xs text-brand-dim text-center mb-5">
              Track your booking status in the <span className="text-brand-teal">My Bookings</span> section below.
            </p>

            {/* CTA */}
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Got it
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
