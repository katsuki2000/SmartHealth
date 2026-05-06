import React, { useEffect, useState } from 'react'
import AppointmentForm from './AppointmentForm'
import './PatientList.css'

const API_BASE = 'http://localhost:3000'

interface Appointment {
  id: string
  dateTime: string
  reason?: string
  status: string
  patientId: string
  practitionerId: string
  patient?: { firstName: string; lastName: string }
  practitioner?: { specialty: string; user?: { lastName: string } }
}

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement')
      const data = await res.json()
      setAppointments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    try {
      const token = getToken()
      await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      loadAppointments()
    } catch (err: any) {
      alert(err.message)
    }
  }

  useEffect(() => { loadAppointments() }, [])

  if (loading) return (
    <div className="pl-loading">
      <div className="pl-spinner" />
      <span>Chargement des rendez-vous...</span>
    </div>
  )

  if (error) return <div className="pl-error">⚠️ {error}</div>

  const statusColor: Record<string, string> = {
    SCHEDULED: '#3b82f6',
    EMERGENCY: '#ef4444',
    COMPLETED: '#10b981',
    CANCELLED: '#94a3b8',
  }

  return (
    <div className="pl-container">
      <div className="pl-header">
        <div className="pl-header-left">
          <h2 className="pl-title">📅 Rendez-vous</h2>
          <span className="pl-badge">{appointments.length}</span>
        </div>
        <div className="pl-header-actions">
          <button className="pl-btn-add" onClick={() => setIsFormOpen(true)} style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)' }}>
            + Nouveau RDV
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="pl-empty">Aucun rendez-vous trouvé.</div>
      ) : (
        <div className="pl-grid">
          {appointments.map(a => (
            <div key={a.id} className="pl-card">
              <div className="pl-card-avatar" style={{ background: `linear-gradient(135deg, ${statusColor[a.status] || '#6366f1'}, ${statusColor[a.status] || '#8b5cf6'}80)` }}>
                {a.status === 'EMERGENCY' ? '🚨' : '📅'}
              </div>
              <div className="pl-card-info">
                <div className="pl-card-name">
                  {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : `Patient #${a.patientId.slice(0, 6)}`}
                </div>
                <div className="pl-card-meta">
                  <span className="pl-tag" style={{ color: statusColor[a.status], borderColor: statusColor[a.status] }}>{a.status}</span>
                  <span className="pl-tag">🕐 {new Date(a.dateTime).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {a.reason && <span className="pl-tag">💬 {a.reason}</span>}
                </div>
              </div>
              <div className="pl-card-actions">
                <button className="pl-action-btn pl-delete" onClick={() => deleteAppointment(a.id)} title="Supprimer">🗑️</button>
              </div>
              <div className="pl-card-id">#{a.id.slice(0, 8)}</div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <AppointmentForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); loadAppointments() }}
        />
      )}
    </div>
  )
}
