import { Monitor, Calendar, Users, Zap, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: <Monitor size={18} />,
    color: '#0a1f2a',
    iconColor: '#5DCAA5',
    title: 'Live maintenance tracking',
    desc: 'Tenants see real-time status updates — Pending, In Progress, Completed — without making a single call.',
  },
  {
    icon: <Calendar size={18} />,
    color: '#1f2010',
    iconColor: '#97C459',
    title: 'Amenity booking',
    desc: 'Book the gym, pool, or clubhouse by date and time. Conflict prevention blocks double-bookings automatically.',
  },
  {
    icon: <Users size={18} />,
    color: '#1a1020',
    iconColor: '#ED93B1',
    title: 'Role-based access',
    desc: 'Tenants and property owners each see their own tailored dashboard — the right tools for the right person.',
  },
  {
    icon: <Zap size={18} />,
    color: '#0a1f2a',
    iconColor: '#5DCAA5',
    title: 'WebSocket real-time',
    desc: 'Socket.io powers instant dashboard updates across all connected users — no page refresh ever needed.',
  },
  {
    icon: <Shield size={18} />,
    color: '#2a1f0a',
    iconColor: '#EF9F27',
    title: 'Secure JWT auth',
    desc: 'Passwordless session management with bcrypt-hashed credentials. Your data stays protected at all times.',
  },
  {
    icon: <Smartphone size={18} />,
    color: '#0f1a0f',
    iconColor: '#97C459',
    title: 'Mobile responsive',
    desc: 'Full desktop and mobile browser support — no app install needed. Works on any device, anywhere.',
  },
]

export default function Features() {
  return (
    <section id="features" className="w-full bg-brand-bg px-8 py-20 border-b border-brand-border-light">

      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-xs text-brand-teal uppercase tracking-widest mb-3">
          Core features
        </p>
        <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight mb-3">
          Everything your building needs
        </h2>
        <p className="text-brand-muted text-sm md:text-base max-w-md mb-12">
          Built for residential and commercial buildings — one system for every stakeholder.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-teal transition-colors duration-300"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: f.color, color: f.iconColor }}
              >
                {f.icon}
              </div>
              <h3 className="font-syne font-semibold text-sm text-white mb-2">
                {f.title}
              </h3>
              <p className="text-brand-muted text-xs leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}