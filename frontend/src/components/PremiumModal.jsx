import React from 'react'

export default function PremiumModal({show, onClose}){
  if(!show) return null
  return (
    <div className="pm-modal-overlay" role="dialog" aria-modal="true">
      <div className="pm-modal">
        <header className="pm-modal-header">
          <h3>Upgrade to AlgoViz PRO</h3>
          <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="pm-modal-body">
          <p>Unlock advanced visualizations, exportable animations, higher step resolution, and exclusive themes.</p>
          <ul>
            <li>High-fidelity graph & tree rendering</li>
            <li>Priority algorithm presets</li>
            <li>Export GIF/MP4 of runs</li>
            <li>Custom color themes</li>
          </ul>
        </div>
        <footer className="pm-modal-footer">
          <button className="pm-cta" onClick={()=>{ alert('Upgrade flow is a demo in this build.') }}>Start Free Trial</button>
          <button className="pm-secondary" onClick={onClose}>Maybe later</button>
        </footer>
      </div>
    </div>
  )
}
