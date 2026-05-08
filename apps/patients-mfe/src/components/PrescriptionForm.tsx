import React, { useState, useEffect } from 'react'
import './ClinicalForms.css'

const API_BASE = 'http://localhost:3000'

interface PrescriptionFormProps {
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

const getPractitionerName = (p: any) => {
  if (p.name) return `Dr. ${p.name}`;
  if (p.firstName && p.lastName && p.firstName !== 'À définir' && p.lastName !== 'À définir') {
    return `Dr. ${p.firstName} ${p.lastName}`;
  }
  return `Médecin #${p.id.slice(0, 6)}`;
};

export default function PrescriptionForm({ onClose, onSuccess }: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  const [formData, setFormData] = useState({
    medications: '',
    instructions: '',
    patientId: '',
    practitionerId: '',
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

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
          setSearchTerm(`${patData[0].firstName} ${patData[0].lastName}`)
        }
      } catch (err) {
        setError('Impossible de charger les listes de médecins/patients.')
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePatientSelect = (p: Patient) => {
    setFormData({ ...formData, patientId: p.id })
    setSearchTerm(`${p.firstName} ${p.lastName}`)
    setShowDropdown(false)
  }

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = getToken()

      const res = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Erreur lors de la création de la prescription')
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
          <h2 className="pf-title" style={{ background: 'linear-gradient(90deg, #34d399, #10b981)', WebkitBackgroundClip: 'text' }}>Rédiger une Ordonnance</h2>
          <button className="pf-close" onClick={onClose}>&times;</button>
        </div>

        {dataLoading ? (
          <div className="pf-error-msg" style={{ background: 'transparent', color: '#94a3b8' }}>Chargement des données...</div>
        ) : (
          <form className="pf-form" onSubmit={handleSubmit} autoComplete="off">
            {error && <div className="pf-error-msg">{error}</div>}

            <div className="pf-row">
              <div className="pf-group" style={{ position: 'relative' }}>
                <label className="pf-label">Patient</label>
                <input 
                  type="text" 
                  className="pf-input" 
                  placeholder="Chercher un patient..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && filteredPatients.length > 0 && (
                  <div className="pf-dropdown">
                    {filteredPatients.map(p => (
                      <div 
                        key={p.id} 
                        className={`pf-dropdown-item ${formData.patientId === p.id ? 'selected' : ''}`}
                        onClick={() => handlePatientSelect(p)}
                      >
                        {p.firstName} {p.lastName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Médecin Prescripteur</label>
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
                <label className="pf-label">Médicaments (Séparés par des virgules)</label>
                <textarea
                  name="medications"
                  className="pf-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  placeholder="Ex: Paracetamol 1000mg, Amoxicilline 1g..."
                  value={formData.medications}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="pf-row">
              <div className="pf-group">
                <label className="pf-label">Posologie & Instructions (Optionnel)</label>
                <textarea
                  name="instructions"
                  className="pf-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Ex: 1 comprimé matin, midi et soir pendant 5 jours."
                  value={formData.instructions}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pf-actions">
              <button type="button" className="pf-btn pf-btn-cancel" onClick={onClose} disabled={loading}>
                Annuler
              </button>
              <button type="submit" className="pf-btn pf-btn-submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} disabled={loading || !formData.patientId || !formData.practitionerId}>
                {loading ? 'Validation...' : 'Créer l\'ordonnance'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
