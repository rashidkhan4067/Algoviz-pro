import React from 'react'

export default function PerformancePanel({steps, speed}){
  const stepCount = steps ? steps.length : 0
  const speedPct = Math.round(100 - ((speed - 50) / (1500 - 50) * 100))
  const targetTime = (stepCount * speed) / 1000
  const tracked = stepCount ? (Math.max(10, targetTime/Math.max(1, stepCount))).toFixed(2) : '0.00'

  return (
    <div className="card">
      <h3>Performance Metrics</h3>
      <div className="metrics">
        <div className="metric"><span>Speed</span><strong>{speedPct}%</strong></div>
        <div className="metric"><span>Target time</span><strong>{targetTime.toFixed(2)} s</strong></div>
        <div className="metric"><span>Tracked time</span><strong>{tracked} ms</strong></div>
      </div>
    </div>
  )
}
