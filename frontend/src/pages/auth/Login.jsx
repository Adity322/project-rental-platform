import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Loader } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    try {
      const data = await loginUser(formData)
      console.log('Login response:', data)

      const user = data.user || data
      const token = data.token

      if (!user || !token) {
        setError('Unexpected response from server. Check console.')
        return
      }

      login(user, token)

      if (user.role === 'owner') {
        navigate('/owner/dashboard')
      } else {
        navigate('/tenant/dashboard')
      }
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
          <p className="text-brand-muted text-sm mt-2">Welcome back — log in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8">

          <h1 className="font-syne font-bold text-xl text-white mb-6">Log in</h1>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" /> Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-brand-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-teal hover:underline">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}