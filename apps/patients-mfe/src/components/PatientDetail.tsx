import React, { useState, useEffect } from 'react'
import './PatientDetail.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8243/smarthealth/1.0.0'

interface ClinicalHistory {
  patient: {
    id: string
    firstName: string
    lastName: string
    birthDate: string
    gender: string
  }
  fhirLinked: boolean
  fhirPatientId?: string
  conditions: any[]
  observations: any[]
  encounters: any[]
  medications: any[]
  allergies: any[]
}

function getToken(): string {
  return localStorage.getItem('smarthealth_token') || ''
}

// ─── Helper: extract readable name from FHIR coding ───
function codingName(resource: any, fallback = 'Non renseigné'): string {
  const code = resource?.code
  if (!code) return fallback
  const coding = code.coding?.[0]
  return coding?.display || code.text || coding?.code || fallback
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// ─── Status Badge ──────────────────────────
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: '#ef4444' },
    resolved: { label: 'Résolu', color: '#10b981' },
    inactive: { label: 'Inactif', color: '#94a3b8' },
    recurrence: { label: 'Récidive', color: '#f59e0b' },
    'entered-in-error': { label: 'Erreur', color: '#6b7280' },
    finished: { label: 'Terminé', color: '#10b981' },
    'in-progress': { label: 'En cours', color: '#3b82f6' },
    planned: { label: 'Planifié', color: '#8b5cf6' },
    cancelled: { label: 'Annulé', color: '#94a3b8' },
  }
  const s = map[status?.toLowerCase()] || { label: status, color: '#6366f1' }
  return (
    <span className="pd-badge" style={{ color: s.color, borderColor: s.color }}>
      {s.label}
    </span>
  )
}

// ─── Encounter class mapping ──────────────
function encounterClass(code?: string): string {
  const map: Record<string, string> = {
    AMB: 'Ambulatoire', IMP: 'Hospitalisation', EMER: 'Urgence',
    HH: 'Soins à domicile', VR: 'Téléconsultation',
    wellness: 'Bilan de santé', outpatient: 'Consultation externe',
    inpatient: 'Hospitalisation', emergency: 'Urgence',
    ambulatory: 'Ambulatoire',
  }
  return map[code || ''] || code || 'Non précisé'
}

// ─── Tab definitions ──────────────────────
type TabId = 'conditions' | 'encounters' | 'observations' | 'medications' | 'allergies'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'conditions', label: 'Diagnostics', icon: '🦠' },
  { id: 'encounters', label: 'Séjours', icon: '🏥' },
  { id: 'observations', label: 'Signes vitaux', icon: '🩺' },
  { id: 'medications', label: 'Traitements', icon: '💊' },
  { id: 'allergies', label: 'Allergies', icon: '⚠️' },
]

export default function PatientDetail({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  const [data, setData] = useState<ClinicalHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('conditions')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`${API_BASE}/patients/${patientId}/clinical-history`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Impossible de charger l\'historique')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [patientId])

  if (loading) {
    return (
      <div className="pd-container">
        <div className="pd-loading"><div className="pd-spinner" /><span>Chargement du dossier médical…</span></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="pd-container">
        <button className="pd-back" onClick={onBack}>← Retour à la liste</button>
        <div className="pd-error">⚠️ {error || 'Données indisponibles'}</div>
      </div>
    )
  }

  const p = data.patient
  const age = Math.floor((Date.now() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  const tabCounts: Record<TabId, number> = {
    conditions: data.conditions.length,
    encounters: data.encounters.length,
    observations: data.observations.length,
    medications: data.medications.length,
    allergies: data.allergies.length,
  }

  return (
    <div className="pd-container">
      {/* Header avec bouton retour */}
      <button className="pd-back" onClick={onBack}>← Retour à la liste</button>

      {/* Identité patient */}
      <div className="pd-identity">
        <div className="pd-avatar">{p.firstName[0]}{p.lastName[0]}</div>
        <div className="pd-identity-info">
          <h2 className="pd-name">{p.firstName} {p.lastName}</h2>
          <div className="pd-meta-row">
            <span className="pd-meta-item">👤 {p.gender === 'male' ? 'Homme' : 'Femme'}</span>
            <span className="pd-meta-item">🎂 {age} ans ({formatDate(p.birthDate)})</span>
            {data.fhirLinked && <span className="pd-fhir-badge">✓ Dossier FHIR lié</span>}
            {!data.fhirLinked && <span className="pd-no-fhir-badge">Aucun dossier FHIR trouvé</span>}
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="pd-summary-grid">
        <div className="pd-summary-card">
          <div className="pd-summary-val">{data.conditions.length}</div>
          <div className="pd-summary-label">Diagnostics</div>
        </div>
        <div className="pd-summary-card">
          <div className="pd-summary-val">{data.encounters.length}</div>
          <div className="pd-summary-label">Séjours</div>
        </div>
        <div className="pd-summary-card">
          <div className="pd-summary-val">{data.observations.length}</div>
          <div className="pd-summary-label">Mesures</div>
        </div>
        <div className="pd-summary-card">
          <div className="pd-summary-val">{data.medications.length}</div>
          <div className="pd-summary-label">Traitements</div>
        </div>
        <div className="pd-summary-card">
          <div className="pd-summary-val">{data.allergies.length}</div>
          <div className="pd-summary-label">Allergies</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="pd-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`pd-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
            {tabCounts[t.id] > 0 && <span className="pd-tab-count">{tabCounts[t.id]}</span>}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="pd-tab-content">
        {/* ─── Diagnostics ─── */}
        {activeTab === 'conditions' && (
          data.conditions.length === 0 ? (
            <div className="pd-empty">Aucun diagnostic enregistré dans le dossier FHIR.</div>
          ) : (
            <div className="pd-timeline">
              {data.conditions.map((c, i) => (
                <div key={i} className="pd-timeline-item">
                  <div className="pd-timeline-dot" style={{ background: c.clinicalStatus?.coding?.[0]?.code === 'active' ? '#ef4444' : '#10b981' }} />
                  <div className="pd-timeline-card">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-title">{codingName(c)}</span>
                      <StatusBadge status={c.clinicalStatus?.coding?.[0]?.code} />
                    </div>
                    <div className="pd-timeline-details">
                      {c.onsetDateTime && <span>📅 Début : {formatDate(c.onsetDateTime)}</span>}
                      {c.abatementDateTime && <span>✅ Fin : {formatDate(c.abatementDateTime)}</span>}
                      {c.category?.[0]?.coding?.[0]?.display && <span>📋 {c.category[0].coding[0].display}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Séjours ─── */}
        {activeTab === 'encounters' && (
          data.encounters.length === 0 ? (
            <div className="pd-empty">Aucun séjour enregistré.</div>
          ) : (
            <div className="pd-timeline">
              {data.encounters.map((e, i) => (
                <div key={i} className="pd-timeline-item">
                  <div className="pd-timeline-dot" style={{ background: '#3b82f6' }} />
                  <div className="pd-timeline-card">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-title">{encounterClass(e.class?.code)}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="pd-timeline-details">
                      {e.period?.start && <span>📅 Du {formatDateTime(e.period.start)}</span>}
                      {e.period?.end && <span>au {formatDateTime(e.period.end)}</span>}
                      {e.type?.[0]?.coding?.[0]?.display && <span>📋 {e.type[0].coding[0].display}</span>}
                      {e.reasonCode?.[0]?.coding?.[0]?.display && <span>💬 {e.reasonCode[0].coding[0].display}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Signes vitaux ─── */}
        {activeTab === 'observations' && (
          data.observations.length === 0 ? (
            <div className="pd-empty">Aucune observation enregistrée.</div>
          ) : (
            <div className="pd-vitals-table">
              <div className="pd-vt-header">
                <span>Indicateur</span><span>Valeur</span><span>Unité</span><span>Date</span>
              </div>
              {data.observations.map((o, i) => {
                const val = o.valueQuantity?.value ?? o.component?.[0]?.valueQuantity?.value ?? '—'
                const unit = o.valueQuantity?.unit ?? o.component?.[0]?.valueQuantity?.unit ?? ''
                return (
                  <div key={i} className="pd-vt-row">
                    <span className="pd-vt-name">{codingName(o, 'Mesure')}</span>
                    <span className="pd-vt-val">{typeof val === 'number' ? val.toFixed(1) : val}</span>
                    <span className="pd-vt-unit">{unit}</span>
                    <span className="pd-vt-date">{formatDate(o.effectiveDateTime)}</span>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ─── Traitements ─── */}
        {activeTab === 'medications' && (
          data.medications.length === 0 ? (
            <div className="pd-empty">Aucun traitement enregistré.</div>
          ) : (
            <div className="pd-timeline">
              {data.medications.map((m, i) => (
                <div key={i} className="pd-timeline-item">
                  <div className="pd-timeline-dot" style={{ background: '#8b5cf6' }} />
                  <div className="pd-timeline-card">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-title">
                        {m.medicationCodeableConcept?.coding?.[0]?.display || m.medicationCodeableConcept?.text || 'Médicament non précisé'}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="pd-timeline-details">
                      {m.authoredOn && <span>📅 Prescrit le {formatDate(m.authoredOn)}</span>}
                      {m.dosageInstruction?.[0]?.text && <span>💊 {m.dosageInstruction[0].text}</span>}
                      {m.reasonReference?.[0]?.display && <span>💬 Pour : {m.reasonReference[0].display}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Allergies ─── */}
        {activeTab === 'allergies' && (
          data.allergies.length === 0 ? (
            <div className="pd-empty">Aucune allergie déclarée.</div>
          ) : (
            <div className="pd-timeline">
              {data.allergies.map((a, i) => (
                <div key={i} className="pd-timeline-item">
                  <div className="pd-timeline-dot" style={{ background: '#f59e0b' }} />
                  <div className="pd-timeline-card">
                    <div className="pd-timeline-header">
                      <span className="pd-timeline-title">
                        {a.code?.coding?.[0]?.display || a.code?.text || 'Allergène non précisé'}
                      </span>
                      {a.criticality && (
                        <span className="pd-badge" style={{
                          color: a.criticality === 'high' ? '#ef4444' : '#f59e0b',
                          borderColor: a.criticality === 'high' ? '#ef4444' : '#f59e0b'
                        }}>
                          {a.criticality === 'high' ? 'Critique' : a.criticality === 'low' ? 'Faible' : a.criticality}
                        </span>
                      )}
                    </div>
                    <div className="pd-timeline-details">
                      {a.category?.[0] && <span>📋 Catégorie : {a.category[0] === 'medication' ? 'Médicament' : a.category[0] === 'food' ? 'Alimentaire' : a.category[0]}</span>}
                      {a.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display && (
                        <span>⚠️ Réaction : {a.reaction[0].manifestation[0].coding[0].display}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
