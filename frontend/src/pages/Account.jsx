import React, {useState} from 'react'

export default function Account(){
  const [apiKey] = useState('sk_live_XXXXXXXXXXXXXXXX')
  const copyKey = async ()=>{
    try{ await navigator.clipboard.writeText(apiKey); alert('API key copied') }catch(e){alert('Copy failed')}
  }
  return (
    <div>
      <h3>Account & Subscription</h3>
      <p>Manage your account profile, subscription, and API credentials.</p>

      <div style={{marginTop:12}} className="card">
        <h4>Profile</h4>
        <div>Name: Demo User</div>
        <div>Email: demo@example.com</div>
      </div>

      <div style={{marginTop:12}} className="card">
        <h4>API Key</h4>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <code style={{padding:8,background:'rgba(255,255,255,0.02)',borderRadius:8}}>{apiKey}</code>
          <button className="small" onClick={copyKey}>Copy</button>
        </div>
        <div style={{marginTop:8,color:'#94a3b8'}}>Keep your API keys secret. Regenerate if compromised.</div>
      </div>
    </div>
  )
}
