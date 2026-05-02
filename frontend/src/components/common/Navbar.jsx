import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-brand-bg border-b border-brand-border-light px-8 py-4 flex items-center justify-between relative z-50">
      
      {/* Logo */}
      <Link to="/" className="font-syne font-extrabold text-lg text-white tracking-tight">
        Property<span className="text-brand-teal">Rental</span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-brand-muted hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="text-sm text-brand-muted hover:text-white transition-colors">How it works</a>
        <a href="#roles" className="text-sm text-brand-muted hover:text-white transition-colors">For tenants</a>
        <a href="#roles" className="text-sm text-brand-muted hover:text-white transition-colors">For owners</a>
      </div>

      {/* Desktop CTA Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to="/login"
          className="text-sm px-4 py-2 rounded-lg border border-brand-faint text-gray-300 hover:bg-brand-card transition-colors"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="text-sm px-4 py-2 rounded-lg bg-brand-teal text-brand-teal-dark font-medium hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-brand-muted hover:text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-brand-surface border-b border-brand-border z-50 flex flex-col px-8 py-6 gap-5 md:hidden">
          <a href="#features" className="text-sm text-brand-muted hover:text-white" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-sm text-brand-muted hover:text-white" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#roles" className="text-sm text-brand-muted hover:text-white" onClick={() => setMenuOpen(false)}>For tenants</a>
          <a href="#roles" className="text-sm text-brand-muted hover:text-white" onClick={() => setMenuOpen(false)}>For owners</a>
          <hr className="border-brand-border" />
          <Link to="/login" className="text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link
            to="/register"
            className="text-sm px-4 py-2 rounded-lg bg-brand-teal text-brand-teal-dark font-medium text-center hover:opacity-90"
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  )
}