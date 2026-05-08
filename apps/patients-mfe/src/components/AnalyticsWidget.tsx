import React, { useState, useEffect } from 'react'
import './AnalyticsWidget.css'

const API_BASE = 'http://localhost:3000'

interface AnalyticsData {
  totalPatients: number
  urgentAppointments: number
  totalPractitioners: number
  averageAge: number
  totalFhirResources: number
  totalConditions: number
  totalEncounters: number
  totalObservations: number
  topPathology: string | null
  topPathologyCount: number
  computedAt: string | null
  status: string
}

interface ChartItem { name: string; count: number }
interface ObsItem { name: string; count: number; avgValue: number; unit: string }
interface ChartsData {
  genderDistribution: { gender: string; count: number }[]
  ageDistribution: { age_group: string; count: number }[]
  topConditions: ChartItem[]
  resourceDistribution: ChartItem[]
  encounterClasses: ChartItem[]
  topObservations: ObsItem[]
  status: string
}

// ─── SVG Bar Chart ──────────────────────────────────
function BarChart({ data, colors, maxBars = 8 }: {
  data: { label: string; value: number }[]
  colors: string[]
  maxBars?: number
}) {
  const items = data.slice(0, maxBars)
  const maxVal = Math.max(...items.map(d => d.value), 1)
  const barH = 28
  const gap = 6
  const h = items.length * (barH + gap)

  return (
    <svg viewBox={`0 0 400 ${h}`} className="aw-chart-svg" preserveAspectRatio="xMinYMin meet">
      {items.map((d, i) => {
        const barW = (d.value / maxVal) * 260
        const y = i * (barH + gap)
        const color = colors[i % colors.length]
        return (
          <g key={i}>
            <rect x="130" y={y} width={barW} height={barH} rx="6" fill={color} opacity="0.85">
              <animate attributeName="width" from="0" to={barW} dur="0.6s" fill="freeze" />
            </rect>
            <text x="125" y={y + barH / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="Inter, sans-serif">
              {d.label.length > 18 ? d.label.slice(0, 18) + '…' : d.label}
            </text>
            <text x={135 + barW} y={y + barH / 2 + 4} fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">
              {d.value.toLocaleString()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── SVG Donut Chart ────────────────────────────────
function DonutChart({ data, colors }: {
  data: { label: string; value: number }[]
  colors: string[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null
  const cx = 80, cy = 80, r = 60, strokeW = 22
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="aw-donut-wrap">
      <svg viewBox="0 0 160 160" className="aw-donut-svg">
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = pct * circ
          const thisOffset = offset
          offset += dash
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i % colors.length]} strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-thisOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              opacity="0.85"
            />
          )
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="700" fontFamily="Inter">{total.toLocaleString()}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter">cas</text>
      </svg>
      <div className="aw-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="aw-legend-item">
            <span className="aw-legend-dot" style={{ background: colors[i % colors.length] }} />
            <span className="aw-legend-label">{d.label}</span>
            <span className="aw-legend-val">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stat Cards ─────────────────────────────────────
const COLORS = {
  primary: '#818cf8',
  success: '#34d399',
  danger: '#f87171',
  warning: '#fbbf24',
  info: '#38bdf8',
  purple: '#a78bfa',
  pink: '#f472b6',
  orange: '#fb923c',
}

const BAR_COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#38bdf8', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#c084fc']
const DONUT_COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#38bdf8', '#a78bfa', '#f472b6', '#fb923c']

export default function AnalyticsWidget() {
  const [summary, setSummary] = useState<AnalyticsData | null>(null)
  const [charts, setCharts] = useState<ChartsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'encounters' | 'vitals'>('overview')

  useEffect(() => {
    const token = localStorage.getItem('smarthealth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined

    Promise.all([
      fetch(`${API_BASE}/api/v1/analytics/summary`, { headers }).then(r => {
        if (!r.ok) throw new Error('Accès refusé ou service indisponible')
        return r.json()
      }),
      fetch(`${API_BASE}/api/v1/analytics/charts`, { headers }).then(r => r.json()),
    ])
      .then(([sum, ch]) => {
        setSummary(sum)
        setCharts(ch)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="aw-container">
        <div className="aw-header-row"><h2 className="aw-title">📊 Tableau de Bord Clinique</h2></div>
        <div className="aw-loading"><div className="aw-spinner" /><span>Chargement des statistiques…</span></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aw-container">
        <div className="aw-header-row"><h2 className="aw-title">📊 Tableau de Bord Clinique</h2></div>
        <div className="aw-error">⚠️ Données temporairement indisponibles. Veuillez réessayer ultérieurement.</div>
      </div>
    )
  }

  const noData = !summary || summary.status !== 'OK'
  const s = summary!
  const c = charts

  const statCards = [
    { label: 'Patients Pris en Charge', value: s.totalPatients, icon: '👥', color: COLORS.primary },
    { label: 'Médecins & Praticiens', value: s.totalPractitioners, icon: '👨‍⚕️', color: COLORS.success },
    { label: 'Diagnostics Actifs', value: s.totalConditions, icon: '🦠', color: COLORS.danger },
    { label: 'Séjours & Consultations', value: s.totalEncounters, icon: '🏥', color: COLORS.info },
    { label: 'Actes Cliniques', value: s.totalObservations, icon: '🩺', color: COLORS.purple },
    { label: 'Âge Moyen', value: `${s.averageAge} ans`, icon: '📊', color: COLORS.warning },
  ]

  const computedLabel = s.computedAt ? new Date(s.computedAt).toLocaleString('fr-FR') : 'jamais'

  const tabs = [
    { id: 'overview' as const, label: 'Démographie', icon: '🏠' },
    { id: 'conditions' as const, label: 'Épidémiologie', icon: '🦠' },
    { id: 'encounters' as const, label: 'Prise en Charge', icon: '🏥' },
    { id: 'vitals' as const, label: 'Signes Cliniques', icon: '🩺' },
  ]

  return (
    <div className="aw-container">
      {/* Header */}
      <div className="aw-header-row">
        <div>
          <h2 className="aw-title">📊 Observatoire de Santé de la Population</h2>
          <p className="aw-subtitle">
            Analyse épidémiologique • Dernière mise à jour : {computedLabel}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="aw-kpi-grid">
        {statCards.map(sc => (
          <div key={sc.label} className="aw-kpi" style={{ '--kpi-accent': sc.color } as React.CSSProperties}>
            <div className="aw-kpi-icon">{sc.icon}</div>
            <div className="aw-kpi-value">{typeof sc.value === 'number' ? sc.value.toLocaleString() : sc.value}</div>
            <div className="aw-kpi-label">{sc.label}</div>
          </div>
        ))}
      </div>

      {/* Top Pathology Highlight */}
      {s.topPathology && (
        <div className="aw-highlight">
          <span className="aw-highlight-badge">🦠 Pathologie Prédominante</span>
          <span className="aw-highlight-name">{s.topPathology}</span>
          <span className="aw-highlight-count">{s.topPathologyCount} cas identifiés</span>
        </div>
      )}

      {/* Tabs */}
      <div className="aw-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`aw-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="aw-tab-content">
        {activeTab === 'overview' && c && (
          <div className="aw-charts-grid">
            <div className="aw-chart-card">
              <h3 className="aw-chart-title">Répartition par genre</h3>
              <DonutChart
                data={c.genderDistribution.map(g => ({ label: g.gender === 'female' ? 'Femmes' : 'Hommes', value: g.count }))}
                colors={[COLORS.pink, COLORS.info]}
              />
            </div>
            <div className="aw-chart-card">
              <h3 className="aw-chart-title">Répartition par âge</h3>
              <BarChart
                data={c.ageDistribution.map(a => ({ label: a.age_group, value: a.count }))}
                colors={BAR_COLORS}
              />
            </div>
          </div>
        )}

        {activeTab === 'conditions' && c && (
          <div className="aw-charts-grid">
            <div className="aw-chart-card aw-chart-wide">
              <h3 className="aw-chart-title">Top 10 Pathologies les plus fréquentes</h3>
              <BarChart
                data={c.topConditions.map(p => ({ label: p.name.replace(/ \(.*\)$/, ''), value: p.count }))}
                colors={BAR_COLORS}
                maxBars={10}
              />
            </div>
          </div>
        )}

        {activeTab === 'encounters' && c && (
          <div className="aw-charts-grid">
            <div className="aw-chart-card">
              <h3 className="aw-chart-title">Classes de consultations</h3>
              <DonutChart
                data={c.encounterClasses.map(e => ({
                  label: e.name === 'AMB' ? 'Ambulatoire' : e.name === 'IMP' ? 'Hospitalisation'
                    : e.name === 'EMER' ? 'Urgence' : e.name === 'HH' ? 'Domicile' : e.name === 'VR' ? 'Virtuel' : e.name,
                  value: e.count
                }))}
                colors={DONUT_COLORS}
              />
            </div>
            <div className="aw-chart-card">
              <h3 className="aw-chart-title">Volume par type de prise en charge</h3>
              <BarChart
                data={c.encounterClasses.map(e => ({
                  label: e.name === 'AMB' ? 'Ambulatoire' : e.name === 'IMP' ? 'Hospitalisation'
                    : e.name === 'EMER' ? 'Urgence' : e.name === 'HH' ? 'Domicile' : e.name === 'VR' ? 'Téléconsultation' : e.name,
                  value: e.count
                }))}
                colors={BAR_COLORS}
              />
            </div>
          </div>
        )}

        {activeTab === 'vitals' && c && (
          <div className="aw-charts-grid">
            <div className="aw-chart-card aw-chart-wide">
              <h3 className="aw-chart-title">Analyse des Signes Cliniques (Valeurs Moyennes)</h3>
              <div className="aw-vitals-table">
                <div className="aw-vt-header">
                  <span>Indicateur</span><span>Volume</span><span>Valeur Moy.</span><span>Unité</span>
                </div>
                {c.topObservations.map((o, i) => (
                  <div key={i} className="aw-vt-row">
                    <span className="aw-vt-name">{o.name.length > 40 ? o.name.slice(0, 40) + '…' : o.name}</span>
                    <span className="aw-vt-count">{o.count.toLocaleString()}</span>
                    <span className="aw-vt-avg" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{o.avgValue}</span>
                    <span className="aw-vt-unit">{o.unit || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  )
}
