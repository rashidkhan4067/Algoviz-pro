import React, {useState} from 'react'

export default function Settings(){
  const [theme, setTheme] = useState('dark')
  const [voice, setVoice] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <div>
      <h3>Settings</h3>
      <p>Manage application preferences. These settings are local to the demo.</p>

      <div style={{marginTop:12}} className="card">
        <h4>Appearance</h4>
        <label className="control-group">Theme
          <select value={theme} onChange={e=>setTheme(e.target.value)}>
            <option value="dark">Dark (recommended)</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="control-group"><input type="checkbox" checked={highContrast} onChange={e=>setHighContrast(e.target.checked)} /> High contrast mode</label>
      </div>

      <div style={{marginTop:12}} className="card">
        <h4>Accessibility</h4>
        <label className="control-group"><input type="checkbox" checked={voice} onChange={e=>setVoice(e.target.checked)} /> Enable voice narration</label>
      </div>
    </div>
  )
}
