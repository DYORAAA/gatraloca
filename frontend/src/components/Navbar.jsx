import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminDashboardUrl } from '../api/students'

const LINKS = [
  { href: '/', label: 'Beranda', section: 'home' },
  { href: '/#jurusan', label: 'Jurusan', section: 'jurusan' },
  { href: '/#film', label: 'Film', section: 'film' },
  { href: '/#flashmob', label: 'Flashmob', section: 'flashmob' },
  { href: '/#yearbook3d', label: 'Buku kenangan', section: 'yearbook3d' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const targets = LINKS
      .map(link => document.getElementById(link.section))
      .filter(Boolean)
    if (!('IntersectionObserver' in window) || targets.length === 0) return undefined

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActiveSection(visible[0].target.id)
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] })
    targets.forEach(target => observer.observe(target))

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="navbar">
      <Link to="/" className="brand">GATRALOCA</Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span />
        <span />
      </button>

      <div className={`nav-pill${open ? ' show' : ''}`} role="navigation" aria-label="Navigasi utama">
        {LINKS.map(link => (
          <a
            href={link.href}
            className={`nav-pill-link${activeSection === link.section ? ' active' : ''}`}
            aria-current={activeSection === link.section ? 'location' : undefined}
            key={link.label}
            onClick={() => {
              setActiveSection(link.section)
              setOpen(false)
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <a href={adminDashboardUrl} className="admin-nav-link" aria-label="Masuk dashboard admin" title="Dashboard admin" data-tooltip="Dashboard admin">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
          <path d="M18 7h4m-2-2v4" />
        </svg>
      </a>
    </nav>
  )
}
