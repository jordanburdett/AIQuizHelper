import { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container-wide">
          <div className="nav-card">
            <nav className="navbar">
              <Link to="/" className="brand-link">
                <span className="brand-dot" />
                <span className="brand-text">Home</span>
              </Link>
              <div className="segmented">
                <NavLink
                  to="/"
                  className={({ isActive }) => `segmented-link ${isActive ? 'is-active' : ''}`}
                  end
                >
                  Home
                </NavLink>
                <NavLink
                  to="/progress"
                  className={({ isActive }) => `segmented-link ${isActive ? 'is-active' : ''}`}
                >
                  Progress
                </NavLink>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>Created by Jordan Burdett. Built with TypeScript, React, and Express.</p>
        </div>
      </footer>
    </div>
  )
}