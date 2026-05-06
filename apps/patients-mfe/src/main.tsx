import React from 'react'
import ReactDOM from 'react-dom/client'
import PatientList from './components/PatientList'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '2rem' }}>
      <PatientList />
    </div>
  </React.StrictMode>
)
