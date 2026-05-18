import React, { useState, useEffect } from 'react'
import './ClinicalForms.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8243/smarthealth/1.0.0'

interface AppointmentFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface Practitioner {
  id: string
  firstName: string
  lastName: string
  specialty: string
}

interface Patient {
  id: string
  firstName: string
  lastName: string
}

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

const translateSpecialty = (s: string) => {
  const map: Record<string, string> = {
    'Diagnostician': 'Diagnosticien',
    'Cardiologue': 'Cardiologue',
    'Généraliste': 'Généraliste',
    'Surgeon': 'Chirurgien',
    'Nurse': 'Infirmier/ère',
  };
  return map[s] || s;
};

const getPractitionerName = (p: Practitioner) => {
  if (p.firstName && p.lastName && p.firstName !== 'À définir' && p.lastName !== 'À définir') {
    return `Dr. ${p.firstName} ${p.lastName}`;
  }
  return `Médecin #${p.id.slice(0, 6)}`;
};

export default function AppointmentForm({ onClose, onSuccess }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  const [formData, setFormData] = useState({
    dateTime: '',
    reason: '',
    status: 'SCHEDULED',
    patientId: '',
    practitionerId: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const token = getToken()
        const [practRes, patRes] = await Promise.all([
          fetch(`${API_BASE}/practitioners`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/patients`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        
        if (!practRes.ok || !patRes.ok) throw new Error('Erreur de chargement des données')
        
        const practData = await practRes.json()
        const patData = await patRes.json()
        
        setPractitioners(practData)
        setPatients(patData)
        
        if (practData.length > 0 && patData.length > 0) {
          setFormData(prev => ({
            ...prev,
            practitionerId: practData[0].id,
            patientId: patData[0].id
          }))
        }
      } catch (err) {
        setError('Impossible de charger les listes de médecins/patients.')
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      
      const payload = {
        ...formData,
        // Convert local datetime string to ISO string
        dateTime: new Date(formData.dateTime).toISOString()
      }

      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Erreur lors de la création du RDV')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pf-modal-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={e => e.stopPropagation()}>
        <div className="pf-header">
          <h2 className="pf-title">Planifier un RDV</h2>
          <button className="pf-close" onClick={onClose}>&times;</button>
        </div>

        {dataLoading ? (
          <div className="pf-error-msg" style={{ background: 'transparent', color: '#94a3b8' }}>Chargement des données...</div>
        ) : (
          <form className="pf-form" onSubmit={handleSubmit}>
            {error && <div className="pf-error-msg">{error}</div>}

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Patient</label>
                <select name="patientId" className="pf-select" value={formData.patientId} onChange={handleChange} required>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Praticien</label>
                <select name="practitionerId" className="pf-select" value={formData.practitionerId} onChange={handleChange} required>
                  {practitioners.map(p => (
                    <option key={p.id} value={p.id}>
                      {getPractitionerName(p)} ({translateSpecialty(p.specialty)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Date et Heure</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  className="pf-input"
                  value={formData.dateTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pf-group">
                <label className="pf-label">Statut</label>
                <select name="status" className="pf-select" value={formData.status} onChange={handleChange}>
                  <option value="SCHEDULED">Planifié (Scheduled)</option>
                  <option value="EMERGENCY">Urgence (Emergency)</option>
                </select>
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Motif de consultation (optionnel)</label>
                <input
                  type="text"
                  name="reason"
                  className="pf-input"
                  placeholder="Ex: Consultation de suivi"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pf-actions">
              <button type="button" className="pf-btn pf-btn-cancel" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="pf-btn pf-btn-submit" disabled={loading || !formData.patientId || !formData.practitionerId}>
                {loading ? 'Planification...' : 'Confirmer le RDV'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
