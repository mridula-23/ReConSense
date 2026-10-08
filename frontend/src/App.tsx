import { useEffect, useState } from 'react'
import { checkBackendHealth } from './services/api'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkBackendHealth()
      if (data && data.status === 'ok') {
        setBackendStatus('Running')
      } else {
        setBackendStatus('Disconnected')
      }
    }
    fetchHealth()
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>ReConSense</h1>
      <h2>Development Environment</h2>
      <p>Frontend is running.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h3 style={{ marginTop: 0 }}>System Status</h3>
        <p style={{ margin: '0.5rem 0' }}>Frontend: <span style={{ color: 'green' }}>●</span> Running</p>
        <p style={{ margin: '0.5rem 0' }}>Backend: <span style={{ color: backendStatus === 'Running' ? 'green' : 'red' }}>●</span> {backendStatus === 'Running' ? 'Connected' : 'Disconnected'}</p>
        <p style={{ margin: '0.5rem 0' }}>Backend status: {backendStatus === 'Running' ? 'OK' : 'Error'}</p>
      </div>
    </div>
  )
}

export default App
