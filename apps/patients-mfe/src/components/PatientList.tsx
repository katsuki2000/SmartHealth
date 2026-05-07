import React, { useEffect, useState } from 'react'
import PatientForm from './PatientForm'
import AppointmentForm from './AppointmentForm'
import PrescriptionForm from './PrescriptionForm'
import './PatientList.css'

interface Patient {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
}

const API_BASE = 'http://localhost:3000'

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

async function fetchPatients(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
}

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return age
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isApptModalOpen, setIsApptModalOpen] = useState(false)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)

  const loadPatients = () => {
    setLoading(true)
    try {
      const token = getToken()
      fetchPatients(token)
        .then(data => { setPatients(data); setLoading(false) })
        .catch(() => { setError('Impossible de charger les patients'); setLoading(false) })
    } catch (e) {
      setError('Non authentifié')
      setLoading(false)
    }
  }

  const deletePatient = async (id: string, name: string) => {
    if (!confirm(`Archiver le dossier du patient "${name}" ? Cette action est définitive.`)) return
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur suppression')
      loadPatients()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression')
    }
  }

  const openEdit = (p: Patient) => {
    setEditingPatient(p)
    setIsModalOpen(true)
  }

  useEffect(() => {
    loadPatients()
  }, [])

  if (loading) return (
    <div className="pl-loading">
      <div className="pl-spinner" />
      <span>Chargement des patients...</span>
    </div>
  )

  if (error) return <div className="pl-error">⚠️ {error}</div>

  return (
    <div className="pl-container">
      <div className="pl-header">
        <div className="pl-header-left">
          <h2 className="pl-title">👥 Gestion de la File Active</h2>
          <span className="pl-badge">{patients.length} Dossiers</span>
        </div>
        <div className="pl-header-actions">
          <button className="pl-btn-add" onClick={() => setIsPrescriptionModalOpen(true)} style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
            📝 Prescription
          </button>
          <button className="pl-btn-add" onClick={() => setIsApptModalOpen(true)} style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)' }}>
            📅 Planifier Acte
          </button>
          <button className="pl-btn-add" onClick={() => { setEditingPatient(null); setIsModalOpen(true) }}>
            + Admission Patient
          </button>
        </div>
      </div>
      {patients.length === 0 ? (
        <div className="pl-empty">Aucun patient trouvé.</div>
      ) : (
        <div className="pl-grid">
          {patients.map(p => (
            <div key={p.id} className="pl-card">
              <div className="pl-card-avatar">
                {p.firstName?.[0]}{p.lastName?.[0]}
              </div>
              <div className="pl-card-info">
                <div className="pl-card-name">{p.firstName} {p.lastName}</div>
                <div className="pl-card-meta">
                  <span className="pl-tag">{p.gender === 'male' ? '♂ Homme' : '♀ Femme'}</span>
                  <span className="pl-tag">🎂 {calcAge(p.birthDate)} ans</span>
                </div>
              </div>
              <div className="pl-card-actions">
                <button className="pl-action-btn pl-edit" onClick={() => openEdit(p)} title="Modifier">✏️</button>
                <button className="pl-action-btn pl-delete" onClick={() => deletePatient(p.id, `${p.firstName} ${p.lastName}`)} title="Supprimer">🗑️</button>
              </div>
              <div className="pl-card-id">#{p.id.slice(0, 8)}</div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <PatientForm
          patient={editingPatient}
          onClose={() => { setIsModalOpen(false); setEditingPatient(null) }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingPatient(null)
            loadPatients()
          }}
        />
      )}

      {isApptModalOpen && (
        <AppointmentForm
          onClose={() => setIsApptModalOpen(false)}
          onSuccess={() => {
            setIsApptModalOpen(false)
            alert('Rendez-vous planifié avec succès !')
          }}
        />
      )}

      {isPrescriptionModalOpen && (
        <PrescriptionForm
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSuccess={() => {
            setIsPrescriptionModalOpen(false)
            alert('Prescription créée avec succès !')
          }}
        />
      )}
    </div>
  )
}
