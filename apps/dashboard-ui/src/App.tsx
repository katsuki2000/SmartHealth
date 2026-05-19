import React, { Suspense, lazy, useState, useEffect } from 'react'
import { useAuth } from './components/AuthContext'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import { 
  Home, Users, CalendarDays, FileText, AlertTriangle, 
  BarChart3, Settings, Activity, Server, Clock, 
  CheckCircle2, Sun, Moon, LogOut, Menu
} from 'lucide-react'
import './App.css'

// Chargement dynamique des Microfrontends (Module Federation)
const PatientList = lazy(() => import('patients_mfe/PatientList'))
const PatientDetail = lazy(() => import('patients_mfe/PatientDetail'))
const EmergencyTrigger = lazy(() => import('patients_mfe/EmergencyTrigger'))
const AnalyticsWidget = lazy(() => import('patients_mfe/AnalyticsWidget'))
const AppointmentList = lazy(() => import('patients_mfe/AppointmentList'))
const PrescriptionList = lazy(() => import('patients_mfe/PrescriptionList'))

const navItems = [
  { id: 'dashboard', label: 'Poste de Travail Clinique', icon: Home, roles: ['ADMIN', 'DOCTOR'] },
  { id: 'patients',  label: 'Dossiers Patients',          icon: Users, roles: ['ADMIN', 'DOCTOR'] },
  { id: 'appointments', label: 'Planning Consultations',  icon: CalendarDays, roles: ['ADMIN', 'DOCTOR'] },
  { id: 'prescriptions', label: 'Gestion Prescriptions',  icon: FileText, roles: ['ADMIN', 'DOCTOR'] },
  { id: 'emergency', label: 'Admission & Urgences',       icon: AlertTriangle, roles: ['ADMIN', 'DOCTOR'] },
  { id: 'analytics', label: 'Décisionnel Clinique',       icon: BarChart3, roles: ['ADMIN'] },
  { id: 'admin',     label: 'Administration Système',     icon: Settings, roles: ['ADMIN'] },
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
      Le module <strong>{name}</strong> est temporairement indisponible.<br />
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
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    urgentAppointments: 0,
    totalPractitioners: 0,
    averageAge: 0,
    scope: 'global'
  })
  const [activities, setActivities] = useState<any[]>([])

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours} ${diffHours === 1 ? 'heure' : 'heures'}`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Hier"
    return `Il y a ${diffDays} jours`
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'PATIENT':
        return <Users size={14} className="text-accent" />
      case 'PRESCRIPTION':
        return <FileText size={14} className="text-success" />
      case 'APPOINTMENT':
        return <CalendarDays size={14} className="text-info" />
      case 'ANALYTICS':
        return <BarChart3 size={14} className="text-warning" />
      case 'EMERGENCY':
        return <AlertTriangle size={14} className="text-danger" />
      default:
        return <Clock size={14} className="text-muted" />
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem('smarthealth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined

    // Fetch stats
    fetch('/api/v1/analytics/live', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch live stats')
        return res.json()
      })
      .then(data => {
        if (data.status === 'OK') {
          setStats({
            totalPatients: data.totalPatients,
            urgentAppointments: data.urgentAppointments,
            totalPractitioners: data.totalPractitioners || 0,
            averageAge: data.averageAge,
            scope: data.scope || 'global'
          })
        }
      })
      .catch(err => console.error('Live stats error:', err))

    // Fetch activities
    fetch('/api/v1/activities', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch activities')
        return res.json()
      })
      .then(data => {
        setActivities(data)
      })
      .catch(err => console.error('Activities error:', err))
  }, [isAuthenticated])

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
              <span className="sidebar-nav-icon"><item.icon size={18} /></span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.id === 'emergency' && <span className="sidebar-badge"></span>}
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
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar} title="Menu">
              <Menu size={20} />
            </button>
            <div className="header-titles">
              <h1 className="header-title">
                {navItems.find(n => n.id === activeNav)?.label}
              </h1>
              <span className="header-subtitle">SmartHealth — Portail clinique interopérable</span>
            </div>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="header-time">
              <div className="header-time-val">{timeStr}</div>
              <div className="header-time-date">{dateStr}</div>
            </div>
            <div className="header-status">
              <span className="header-status-dot" />
              <span>Services opérationnels</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="main-content">
          {activeNav === 'dashboard' && (
            <div className="dashboard-grid">
              {/* Ligne 1 : Accueil */}
              <div className="dashboard-row-1">
                <section className="card welcome-card">
                  <div className="welcome-content">
                    <h2 className="welcome-title">Bienvenue, {user?.role?.toUpperCase() === 'ADMIN' ? 'administrateur' : 'docteur'}</h2>
                    <p className="welcome-subtitle">
                      Vue d'ensemble des dossiers patients, consultations, prescriptions et indicateurs décisionnels.
                    </p>
                  </div>
                </section>
              </div>

              {/* Ligne 2 & 3 : Colonnes */}
              <div className="dashboard-cols">
                <div className="dashboard-col-left">
                  {/* Indicateurs Cliniques */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-header"><Users size={16}/> Patients suivis</div>
                      <div className="stat-value">{stats.totalPatients}</div>
                      <div className="stat-sub">{stats.scope === 'doctor' ? 'Vos patients suivis' : 'Dossiers globaux actifs'}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-header"><Activity size={16}/> Âge Moyen</div>
                      <div className="stat-value">{stats.averageAge} ans</div>
                      <div className="stat-sub">{stats.scope === 'doctor' ? 'Moyenne de vos patients' : 'Moyenne générale de la plateforme'}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-header"><AlertTriangle size={16}/> Urgences Critiques</div>
                      <div className="stat-value">{stats.urgentAppointments}</div>
                      <div className="stat-sub">{stats.scope === 'doctor' ? 'Vos cas urgents' : 'Parcours d\'urgence actifs'}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-header"><Users size={16}/> Praticiens Actifs</div>
                      <div className="stat-value">{stats.scope === 'doctor' ? '1 (Vous)' : stats.totalPractitioners}</div>
                      <div className="stat-sub">{stats.scope === 'doctor' ? 'Médecin connecté' : 'Médecins enregistrés'}</div>
                    </div>
                  </div>

                  {/* Graphiques Démographie (Admin only) */}
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <section className="card mt-4">
                      <div className="card-header">
                        <div className="card-header-titles">
                          <h2 className="card-title"><BarChart3 size={18} className="icon-mr"/> Indicateurs cliniques</h2>
                          <span className="card-subtitle-tech">FHIR/JSONB · Dernière mise à jour : {timeStr}</span>
                        </div>
                      </div>
                      <p className="card-hint">Données consolidées à partir des dossiers patients et ressources cliniques.</p>
                      <ErrorBoundary name="AnalyticsWidget">
                        <Suspense fallback={<MFELoader />}>
                          <AnalyticsWidget />
                        </Suspense>
                      </ErrorBoundary>
                    </section>
                  )}
                </div>

                <div className="dashboard-col-right">
                  {/* Accès Urgence */}
                  <section className="card emergency-card mb-4">
                    <div className="card-header">
                      <h2 className="card-title text-danger"><AlertTriangle size={18} className="icon-mr"/> Admission d'urgence</h2>
                    </div>
                    <p className="card-hint mb-3">Déclencher un parcours d'admission critique avec suivi du workflow.</p>
                    
                    <div className="emergency-steps">
                      <div className="step"><CheckCircle2 size={14}/> Validation patient</div>
                      <div className="step"><CheckCircle2 size={14}/> Notification clinique</div>
                      <div className="step"><CheckCircle2 size={14}/> Suivi du workflow</div>
                    </div>
                    
                    <div className="mt-3">
                      <ErrorBoundary name="EmergencyTrigger">
                        <Suspense fallback={<MFELoader />}>
                          <EmergencyTrigger />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                    <div className="tech-status-tiny mt-3">Orchestration : Temporal</div>
                  </section>
                  
                  {/* État des services */}
                  <section className="card mb-4">
                    <div className="card-header">
                      <h2 className="card-title"><Server size={18} className="icon-mr"/> État de la plateforme</h2>
                    </div>
                    <div className="compact-status-list">
                      <div className="compact-status-item">
                        <span>API clinique</span><span className="badge badge-success">Active</span>
                      </div>
                      <div className="compact-status-item">
                        <span>Base de données</span><span className="badge badge-success">Active</span>
                      </div>
                      <div className="compact-status-item">
                        <span>Messagerie</span><span className="badge badge-success">Active</span>
                      </div>
                      <div className="compact-status-item">
                        <span>Orchestration</span><span className="badge badge-success">Active</span>
                      </div>
                      <div className="compact-status-item">
                        <span>Gateway</span><span className="badge badge-success">Active</span>
                      </div>
                      <div className="compact-status-item">
                        <span>Analytics</span><span className="badge badge-muted">Disponible</span>
                      </div>
                    </div>
                  </section>

                  {/* Dernières activités */}
                  <section className="card">
                    <div className="card-header">
                      <h2 className="card-title"><Clock size={18} className="icon-mr"/> Dernières activités</h2>
                    </div>
                    <div className="activity-list-compact">
                      {activities.length > 0 ? (
                        activities.map((act, index) => (
                          <div key={index} className="activity-row">
                            {getActivityIcon(act.type)}
                            <div className="act-details">
                              <span className="act-title">{act.title}</span>
                              <span className="act-time">{formatRelativeTime(act.time)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activities" style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune activité récente</div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
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
                <div className="card-header">
                  <h2 className="card-title"><BarChart3 size={18} className="icon-mr"/> Indicateurs cliniques</h2>
                </div>
                <p className="card-hint">Données consolidées à partir des dossiers patients et ressources cliniques. FHIR/JSONB.</p>
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
                  <h2 className="card-title"><Settings size={18} className="icon-mr"/> Administration Système</h2>
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
