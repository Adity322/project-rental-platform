import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/auth'
import { Eye, EyeOff, Loader } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    propertyId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.role === 'tenant' && !formData.propertyId.trim()) {
      setError('Tenants must enter a Property ID to register')
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }
      if (formData.role === 'tenant') {
        payload.propertyId = formData.propertyId.trim()
      }

      await registerUser(payload)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-syne font-extrabold text-2xl text-white tracking-tight">
            Property<span className="text-brand-teal">Rental</span>
          </Link>
          <p className="text-brand-muted text-sm mt-2">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">

          <h1 className="font-syne font-bold text-xl text-white mb-6">Register</h1>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-brand-muted font-medium">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Arjun Sharma"
                required
                className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-brand-muted font-medium">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="arjun@example.com"
                required
                className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-brand-muted font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dim hover:text-brand-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-brand-muted font-medium">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'tenant', propertyId: '' })}
                  className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'tenant'
                      ? 'bg-[#0a1f2a] border-brand-teal text-brand-teal'
                      : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-faint'
                  }`}
                >
                  Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'owner', propertyId: '' })}
                  className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'owner'
                      ? 'bg-[#1f2010] border-[#639922] text-[#97C459]'
                      : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-faint'
                  }`}
                >
                  Property Owner
                </button>
              </div>
            </div>

            {/* Property ID — only for tenants */}
            {formData.role === 'tenant' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-brand-muted font-medium">
                  Property ID
                  <span className="text-brand-dim ml-1">(get this from your property owner)</span>
                </label>
                <input
                  type="text"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  placeholder="e.g. 64f3a2b1c9e77..."
                  className="bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-sm text-white placeholder-brand-dim focus:outline-none focus:border-brand-teal transition-colors font-mono"
                />
                <p className="text-xs text-brand-dim mt-0.5">
                  Ask your building owner for the Property ID from their dashboard
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" /> Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-brand-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-teal hover:underline">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}