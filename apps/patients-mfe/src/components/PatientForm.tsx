import React, { useState } from 'react'
import './ClinicalForms.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8243/smarthealth/1.0.0'

interface Patient {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
}

interface PatientFormProps {
  patient?: Patient | null
  onClose: () => void
  onSuccess: () => void
}

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

export default function PatientForm({ patient, onClose, onSuccess }: PatientFormProps) {
  const isEditMode = !!patient
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    birthDate: patient?.birthDate?.split('T')[0] || '',
    gender: patient?.gender || 'other',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      const url = isEditMode ? `${API_BASE}/patients/${patient!.id}` : `${API_BASE}/patients`
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du patient`)
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
          <h2 className="pf-title">{isEditMode ? 'Modifier le Patient' : 'Nouveau Patient'}</h2>
          <button className="pf-close" onClick={onClose}>&times;</button>
        </div>

        <form className="pf-form" onSubmit={handleSubmit}>
          {error && <div className="pf-error-msg">{error}</div>}

          <div className="pf-row">
            <div className="pf-group">
              <label className="pf-label">Prénom</label>
              <input
                type="text"
                name="firstName"
                className="pf-input"
                placeholder="Ex: Jean"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pf-group">
              <label className="pf-label">Nom</label>
              <input
                type="text"
                name="lastName"
                className="pf-input"
                placeholder="Ex: Rakoto"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pf-row">
            <div className="pf-group">
              <label className="pf-label">Date de naissance</label>
              <input
                type="date"
                name="birthDate"
                className="pf-input"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pf-group">
              <label className="pf-label">Genre</label>
              <select
                name="gender"
                className="pf-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="male">Homme (Male)</option>
                <option value="female">Femme (Female)</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div className="pf-actions">
            <button type="button" className="pf-btn pf-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="pf-btn pf-btn-submit" disabled={loading}>
              {loading ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Enregistrer' : 'Créer le patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
