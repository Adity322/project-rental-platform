import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRequests, createRequest } from '../../api/requests'
import { ArrowLeft, Plus, X, Loader, AlertCircle } from 'lucide-react'

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

const categories = ['plumbing', 'electrical', 'general']
const priorities = ['low', 'medium', 'high']

export default function MaintenanceRequests() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    category: 'plumbing',
    priority: 'medium',
    propertyId: user?.property || '',
  })

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const requestsData = await getRequests(token)
      setRequests(requestsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const newRequest = await createRequest(formData, token)
      setRequests([newRequest, ...requests])
      setShowModal(false)
      setFormData({
        description: '',
        category: 'plumbing',
        priority: 'medium',
        propertyId: user?.property || '',
      })
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/tenant/dashboard"
              className="flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <h1 className="font-syne font-bold text-2xl text-white">Maintenance Requests</h1>
              <p className="text-brand-muted text-sm mt-0.5">Track and manage your maintenance issues</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New Request
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-brand-border-light">
            <div className="col-span-4 text-xs text-brand-dim uppercase tracking-wider font-medium">Description</div>
            <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Category</div>
            <div className="col-span-1 text-xs text-brand-dim uppercase tracking-wider font-medium">Priority</div>
            <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Status</div>
            <div className="col-span-1 text-xs text-brand-dim uppercase tracking-wider font-medium">Created</div>
            <div className="col-span-2 text-xs text-brand-dim uppercase tracking-wider font-medium">Resolved</div>
          </div>

          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={28} className="text-brand-dim" />
              <p className="text-brand-muted text-sm">No maintenance requests yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs text-brand-teal hover:underline"
              >
                Submit your first request
              </button>
            </div>
          ) : (
            requests.map((req, i) => (
              <div
                key={req._id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-brand-card transition-colors ${i !== 0 ? 'border-t border-brand-border-light' : ''}`}
              >
                <div className="col-span-4">
                  <p className="text-sm text-white">{req.description}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-brand-muted capitalize">{req.category}</span>
                </div>
                <div className="col-span-1">
                  <span className={`text-xs font-medium capitalize ${priorityColors[req.priority?.toLowerCase()]}`}>
                    {req.priority}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[req.status?.toLowerCase()] || 'bg-brand-card text-brand-muted border-brand-border'}`}>
                    {req.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-brand-dim">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2">
                  {req.resolved_at ? (
                    <span className="text-xs text-[#97C459]">
                      {new Date(req.resolved_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs text-brand-dim">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md">

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-lg text-white">New Maintenance Request</h2>
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


              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                  required
                  rows={3}
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-colors"
                >
                  {categories.map(c => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2.5 rounded-lg border text-xs font-medium transition-colors capitalize ${formData.priority === p
                        ? p === 'high'
                          ? 'bg-red-900/30 border-red-500 text-red-400'
                          : p === 'medium'
                            ? 'bg-[#2a1f0a] border-[#EF9F27] text-[#EF9F27]'
                            : 'bg-[#0a1f2a] border-brand-teal text-brand-teal'
                        : 'bg-brand-card border-brand-border text-brand-muted'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <><Loader size={16} className="animate-spin" /> Submitting...</>
                ) : (
                  'Submit Request'
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}