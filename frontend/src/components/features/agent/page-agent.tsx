import { useEffect } from 'react'
import { useAgentStore } from '@/stores/agent-store'
import { AgentFab } from './agent-fab'
import { AgentPanel } from './agent-panel'
import { CrisisBanner } from './crisis-banner'
import { useLocation } from 'react-router-dom'

export function PageAgent() {
  const { isOpen, togglePanel, setShowCrisisBanner } = useAgentStore()
  const location = useLocation()

  useEffect(() => {
    const isTestResult = location.pathname === '/test' && location.search.includes('result')
    const severityParam = new URLSearchParams(location.search).get('severity')
    if (isTestResult && (severityParam === 'high' || severityParam === 'severe')) {
      setShowCrisisBanner(true)
    }
  }, [location, setShowCrisisBanner])

  return (
    <>
      <CrisisBanner />
      {isOpen && <AgentPanel />}
      <AgentFab isOpen={isOpen} onClick={togglePanel} />
    </>
  )
}
