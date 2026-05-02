import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="w-full bg-brand-bg px-8 py-20 flex flex-col items-center text-center border-b border-brand-border-light">

      {/* Live Badge */}
      <div className="flex items-center gap-2 bg-[#0f2a1f] border border-brand-teal-mid rounded-full px-4 py-1.5 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
        <span className="text-brand-teal font-mono text-xs">
          Real-time · WebSocket powered
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-syne font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight max-w-3xl mb-5">
        Your entire building,{' '}
        <span className="text-brand-teal">managed in one place.</span>
      </h1>

      {/* Subheading */}
      <p className="text-brand-muted text-base md:text-lg leading-relaxed max-w-xl mb-10">
        Submit maintenance requests, track live status, and book shared amenities — all without a single phone call or email.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">

        <Link
          to="/register"
          className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Get started free <ArrowRight size={16} />
        </Link>

        <a
          href="#features"
          className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-faint text-gray-300 text-sm hover:bg-brand-card transition-colors"
        >
          <Zap size={16} className="text-brand-teal" /> See features
        </a>

      </div>

      {/* Stats Row */}
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-brand-border border border-brand-border rounded-xl overflow-hidden w-full max-w-md">

        <div className="flex-1 px-6 py-4 text-center">
          <div className="font-syne font-bold text-2xl text-brand-teal">0</div>
          <div className="text-xs text-brand-dim mt-1">booking conflicts</div>
        </div>

        <div className="flex-1 px-6 py-4 text-center">
          <div className="font-syne font-bold text-2xl text-brand-teal">&lt;48h</div>
          <div className="text-xs text-brand-dim mt-1">avg resolution</div>
        </div>

        <div className="flex-1 px-6 py-4 text-center">
          <div className="font-syne font-bold text-2xl text-brand-teal">99%</div>
          <div className="text-xs text-brand-dim mt-1">uptime target</div>
        </div>

      </div>

    </section>
  )
}