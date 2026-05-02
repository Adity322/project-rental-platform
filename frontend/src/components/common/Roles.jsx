import { CheckCircle } from 'lucide-react'

const tenantFeatures = [
  'Submit maintenance requests anytime',
  'Track live status updates in real time',
  'Book gym, pool, parking and more',
  'View full request history',
]

const ownerFeatures = [
  'View all requests across every unit',
  'Update request status live',
  'Manage amenity schedules',
  'Monitor KPIs on owner dashboard',
]

export default function Roles() {
  return (
    <section id="roles" className="w-full bg-brand-bg px-8 py-20 border-b border-brand-border-light">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <p className="font-mono text-xs text-brand-teal uppercase tracking-widest mb-3">
          Built for everyone
        </p>
        <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight mb-3">
          Two roles, one platform
        </h2>
        <p className="text-brand-muted text-sm md:text-base max-w-md mb-12">
          Whether you live in the building or manage it — everything you need is right here.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tenant Card */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-brand-teal transition-colors duration-300">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0a1f2a] border border-brand-teal-mid mb-5">
              <span className="font-mono text-xs text-brand-teal">Tenant</span>
            </div>
            <h3 className="font-syne font-bold text-xl text-white mb-2">
              For residents
            </h3>
            <p className="text-brand-muted text-sm mb-6 leading-relaxed">
              Everything you need to manage your stay — without chasing anyone for updates.
            </p>
            <div className="flex flex-col gap-3">
              {tenantFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3 border-t border-brand-border-light pt-3">
                  <CheckCircle size={14} className="text-brand-teal flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Card */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-[#97C459] transition-colors duration-300">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1f2010] border border-[#639922] mb-5">
              <span className="font-mono text-xs text-[#C0DD97]">Property Owner</span>
            </div>
            <h3 className="font-syne font-bold text-xl text-white mb-2">
              For managers
            </h3>
            <p className="text-brand-muted text-sm mb-6 leading-relaxed">
              All requests across every unit in one view — resolve faster, manage smarter.
            </p>
            <div className="flex flex-col gap-3">
              {ownerFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3 border-t border-brand-border-light pt-3">
                  <CheckCircle size={14} className="text-[#97C459] flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}