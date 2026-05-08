import React, { Suspense, lazy, useState, useEffect } from 'react'
import { useAuth } from './components/AuthContext'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import './App.css'

// Chargement dynamique des Microfrontends (Module Federation)
const PatientList = lazy(() => import('patients_mfe/PatientList'))
const PatientDetail = lazy(() => import('patients_mfe/PatientDetail'))
const EmergencyTrigger = lazy(() => import('patients_mfe/EmergencyTrigger'))
const AnalyticsWidget = lazy(() => import('patients_mfe/AnalyticsWidget'))
const AppointmentList = lazy(() => import('patients_mfe/AppointmentList'))
const PrescriptionList = lazy(() => import('patients_mfe/PrescriptionList'))

const navItems = [
  { id: 'dashboard', label: 'Poste de Travail Clinique', icon: '🏠', roles: ['ADMIN', 'DOCTOR'] },
  { id: 'patients',  label: 'Dossiers Patients (DPE)',    icon: '👥', roles: ['ADMIN', 'DOCTOR'] },
  { id: 'appointments', label: 'Planning Consultations',  icon: '📅', roles: ['ADMIN', 'DOCTOR'] },
  { id: 'prescriptions', label: 'Gestion Prescriptions',  icon: '💊', roles: ['ADMIN', 'DOCTOR'] },
  { id: 'emergency', label: 'Admission & Urgences',       icon: '🚨', roles: ['ADMIN', 'DOCTOR'] },
  { id: 'analytics', label: 'Décisionnel Clinique',       icon: '📊', roles: ['ADMIN'] },
  { id: 'admin',     label: 'Administration Système',     icon: '⚙️', roles: ['ADMIN'] },
]

function MFELoader() {
  return (
    <div className="mfe-loader">
      <div className="mfe-spinner" />
      <span>Chargement du module…</span>
    </div>
  )
}

function MFEError({ name }: { name: string }) {
  return (
    <div className="mfe-error">
      ⚠️ Ce module est temporairement indisponible.<br />
      <small>Veuillez contacter l'administrateur système si le problème persiste.</small>
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <MFEError name={this.props.name} />
    return this.props.children
  }
}

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('smarthealth_theme') || 'dark')
  const now = new Date()
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('smarthealth_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(true)
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed)
    }
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className={`app-shell ${isDesktopCollapsed ? 'collapsed' : ''}`}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'visible' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <div className="sidebar-logo-name">SmartHealth</div>
            <div className="sidebar-logo-sub">Portail Clinique</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.filter(item => item.roles.includes(user?.role?.toUpperCase() || 'DOCTOR')).map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); setIsMobileMenuOpen(false); }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.id === 'emergency' && <span className="sidebar-badge">!</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.email.slice(0, 2).toUpperCase() || 'U'}</div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name" title={user?.email}>{user?.email.split('@')[0]}</div>
              <div className="sidebar-user-role">{user?.role?.toUpperCase() === 'ADMIN' ? 'Administrateur' : 'Médecin'}</div>
            </div>
            <button className="sidebar-logout-btn" onClick={logout} title="Déconnexion">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">
              {navItems.find(n => n.id === activeNav)?.icon}&nbsp;
              {navItems.find(n => n.id === activeNav)?.label}
            </h1>
            <button className="hamburger-btn" onClick={toggleSidebar} title="Réduire le menu">☰</button>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="header-time">
              <div className="header-time-val">{timeStr}</div>
              <div className="header-time-date">{dateStr}</div>
            </div>
            <div className="header-status">
              <span className="header-status-dot" />
              <span>Tous les services actifs</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="main-content">
          {activeNav === 'dashboard' && (
            <div className="page-grid">
              <section className="card card-full">
                <div className="card-header">
                  <h2 className="card-title">Bienvenue sur le Portail SmartHealth</h2>
                </div>
                <p className="card-text">
                  Plateforme d'interopérabilité pour la gestion centralisée des données cliniques,
                  le suivi automatisé des parcours de soins et l'analyse décisionnelle de santé.
                </p>

              </section>

              {user?.role?.toUpperCase() === 'ADMIN' && (
                <section className="card">
                  <div className="card-header"><h2 className="card-title">📉 Indicateurs de Santé</h2></div>
                  <ErrorBoundary name="AnalyticsWidget">
                    <Suspense fallback={<MFELoader />}>
                      <AnalyticsWidget />
                    </Suspense>
                  </ErrorBoundary>
                </section>
              )}

              <section className="card">
                <div className="card-header"><h2 className="card-title">🚨 Protocoles d'Urgence</h2></div>
                <ErrorBoundary name="EmergencyTrigger">
                  <Suspense fallback={<MFELoader />}>
                    <EmergencyTrigger />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'patients' && (
            <div className="page-grid">
              <section className="card card-full">
                <ErrorBoundary name="PatientList">
                  <Suspense fallback={<MFELoader />}>
                    {selectedPatientId ? (
                      <PatientDetail
                        patientId={selectedPatientId}
                        onBack={() => setSelectedPatientId(null)}
                      />
                    ) : (
                      <PatientList onSelectPatient={(id: string) => setSelectedPatientId(id)} />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'emergency' && (
            <div className="page-grid">
              <section className="card card-full">
                <ErrorBoundary name="EmergencyTrigger">
                  <Suspense fallback={<MFELoader />}>
                    <EmergencyTrigger />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'analytics' && (
            <div className="page-grid">
              <section className="card card-full">
                <ErrorBoundary name="AnalyticsWidget">
                  <Suspense fallback={<MFELoader />}>
                    <AnalyticsWidget />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'appointments' && (
            <div className="page-grid">
              <section className="card card-full">
                <ErrorBoundary name="AppointmentList">
                  <Suspense fallback={<MFELoader />}>
                    <AppointmentList />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'prescriptions' && (
            <div className="page-grid">
              <section className="card card-full">
                <ErrorBoundary name="PrescriptionList">
                  <Suspense fallback={<MFELoader />}>
                    <PrescriptionList />
                  </Suspense>
                </ErrorBoundary>
              </section>
            </div>
          )}

          {activeNav === 'admin' && user?.role?.toUpperCase() === 'ADMIN' && (
            <div className="page-grid">
              <section className="card card-full">
                <div className="card-header">
                  <h2 className="card-title">⚙️ Administration Système</h2>
                </div>
                <UserManagement />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
