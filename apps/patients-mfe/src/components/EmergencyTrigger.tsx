import React, { useState } from 'react'
import './EmergencyTrigger.css'

const API_BASE = 'http://localhost:3000'

interface WorkflowResult {
  patientId: string
  practitionerId: string
  appointmentId: string
  status: string
}

function getToken(): string {
  const token = localStorage.getItem('smarthealth_token')
  if (!token) throw new Error('Non authentifié')
  return token
}

async function triggerEmergencyWorkflow(): Promise<WorkflowResult> {
  const token = getToken()

  // On envoie simplement la demande à notre API NestJS, qui elle-même 
  // utilisera le client Temporal pour démarrer le workflow !
  const res = await fetch(`${API_BASE}/api/v1/orchestrator/emergency`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      firstName: 'Urgence',
      lastName: `Patient-${Date.now().toString().slice(-4)}`,
      birthDate: '1985-06-15',
      gender: 'male',
      reason: 'Admission urgence depuis le Dashboard'
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Échec du déclenchement du workflow')
  }

  // L'API nous retourne directement le résultat final du workflow Temporal !
  const workflowResult = await res.json()
  return workflowResult
}

type State = 'idle' | 'loading' | 'success' | 'error'

export default function EmergencyTrigger() {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<WorkflowResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleTrigger = async () => {
    setState('loading')
    setResult(null)
    setErrorMsg('')
    try {
      const res = await triggerEmergencyWorkflow()
      setResult(res)
      setState('success')
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur inconnue')
      setState('error')
    }
  }

  const handleReset = () => { setState('idle'); setResult(null); setErrorMsg('') }

  return (
    <div className="et-container">
      <div className="et-header">
        <div className="et-icon-pulse">🚨</div>
        <div>
          <h2 className="et-title">Procédure d'Admission Immédiate</h2>
          <p className="et-subtitle">Protocole de prise en charge d'urgence automatisé</p>
        </div>
      </div>

      {state === 'idle' && (
        <button className="et-btn et-btn-emergency" onClick={handleTrigger}>
          <span>🏥</span> Initier Admission Critique
        </button>
      )}

      {state === 'loading' && (
        <div className="et-status et-loading">
          <div className="et-spinner" />
          <div>
            <div className="et-status-title">Protocole en cours…</div>
            <div className="et-status-sub">Identification → Orientation Clinique → Planification Examen</div>
          </div>
        </div>
      )}

      {state === 'success' && result && (
        <div className="et-status et-success">
          <div className="et-check">✓</div>
          <div>
            <div className="et-status-title">Admission Finalisée</div>
            <div className="et-result-grid">
              <div className="et-result-item">
                <span className="et-result-label">ID Patient</span>
                <span className="et-result-val">#{result.patientId.slice(0, 8)}</span>
              </div>
              <div className="et-result-item">
                <span className="et-result-label">ID Praticien</span>
                <span className="et-result-val">#{result.practitionerId.slice(0, 8)}</span>
              </div>
              <div className="et-result-item">
                <span className="et-result-label">RDV ID</span>
                <span className="et-result-val">#{result.appointmentId.slice(0, 8)}</span>
              </div>
              <div className="et-result-item">
                <span className="et-result-label">Statut</span>
                <span className="et-result-val et-result-status">{result.status}</span>
              </div>
            </div>
          </div>
          <button className="et-btn-reset" onClick={handleReset}>Nouvelle urgence</button>
        </div>
      )}

      {state === 'error' && (
        <div className="et-status et-error">
          <span className="et-error-icon">⚠️</span>
          <div>
            <div className="et-status-title">Erreur</div>
            <div className="et-status-sub">{errorMsg}</div>
          </div>
          <button className="et-btn-reset" onClick={handleReset}>Réessayer</button>
        </div>
      )}
    </div>
  )
}
