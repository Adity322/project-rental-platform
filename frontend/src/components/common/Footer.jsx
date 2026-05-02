import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="w-full bg-brand-bg px-8 py-24 border-b border-brand-border-light">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <p className="font-mono text-xs text-brand-teal uppercase tracking-widest mb-4">
            Get started today
          </p>
          <h2 className="font-syne font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight mb-5">
            Ready to modernise your{' '}
            <span className="text-brand-teal">building management?</span>
          </h2>
          <p className="text-brand-muted text-sm md:text-base max-w-md mb-10">
            No phone calls. No missed emails. No double-bookings. Just one clean platform for your entire building.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-teal text-brand-teal-dark font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Get started free <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-brand-faint text-gray-300 text-sm hover:bg-brand-card transition-colors"
            >
              Log in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0a0a0a] px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-syne font-extrabold text-sm text-[#444] tracking-tight">
            Property<span className="text-brand-teal-mid">Rental</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-[#444] hover:text-brand-muted transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-[#444] hover:text-brand-muted transition-colors">How it works</a>
            <a href="#roles" className="text-xs text-[#444] hover:text-brand-muted transition-colors">Roles</a>
            <Link to="/login" className="text-xs text-[#444] hover:text-brand-muted transition-colors">Login</Link>
          </div>
          <p className="font-mono text-xs text-[#444]">
            © 2026 PropertyRental · All rights reserved
          </p>
        </div>
      </footer>
    </>
  )
}