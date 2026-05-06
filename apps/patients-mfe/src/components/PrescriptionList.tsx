import React, { useEffect, useState } from 'react'
import PrescriptionForm from './PrescriptionForm'
import './PatientList.css'

const API_BASE = 'http://localhost:3000'

interface Prescription {
  id: string
  medications: string
  instructions?: string
  patientId: string
  practitionerId: string
  createdAt: string
  patient?: { firstName: string; lastName: string }
}

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadPrescriptions = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement')
      const data = await res.json()
      setPrescriptions(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deletePrescription = async (id: string) => {
    if (!confirm('Supprimer cette ordonnance ?')) return
    try {
      const token = getToken()
      await fetch(`${API_BASE}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      loadPrescriptions()
    } catch (err: any) {
      alert(err.message)
    }
  }

  useEffect(() => { loadPrescriptions() }, [])

  if (loading) return (
    <div className="pl-loading">
      <div className="pl-spinner" />
      <span>Chargement des ordonnances...</span>
    </div>
  )

  if (error) return <div className="pl-error">⚠️ {error}</div>

  return (
    <div className="pl-container">
      <div className="pl-header">
        <div className="pl-header-left">
          <h2 className="pl-title">💊 Ordonnances</h2>
          <span className="pl-badge">{prescriptions.length}</span>
        </div>
        <div className="pl-header-actions">
          <button className="pl-btn-add" onClick={() => setIsFormOpen(true)} style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
            + Nouvelle Ordonnance
          </button>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="pl-empty">Aucune ordonnance trouvée.</div>
      ) : (
        <div className="pl-grid">
          {prescriptions.map(p => (
            <div key={p.id} className="pl-card">
              <div className="pl-card-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                💊
              </div>
              <div className="pl-card-info">
                <div className="pl-card-name">
                  {p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : `Patient #${p.patientId.slice(0, 6)}`}
                </div>
                <div className="pl-card-meta">
                  <span className="pl-tag">💊 {p.medications.length > 40 ? p.medications.slice(0, 40) + '…' : p.medications}</span>
                  {p.instructions && <span className="pl-tag">📋 {p.instructions.length > 30 ? p.instructions.slice(0, 30) + '…' : p.instructions}</span>}
                </div>
              </div>
              <div className="pl-card-actions">
                <button className="pl-action-btn pl-delete" onClick={() => deletePrescription(p.id)} title="Supprimer">🗑️</button>
              </div>
              <div className="pl-card-id">#{p.id.slice(0, 8)}</div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <PrescriptionForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); loadPrescriptions() }}
        />
      )}
    </div>
  )
}
