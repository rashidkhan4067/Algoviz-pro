import React from 'react'

const PLANS = [
  {name:'Starter', price:'Free', bullets:['Basic visualizations','Up to 100 steps','Community support']},
  {name:'Pro', price:'$9/mo', bullets:['High resolution steps','Export animations','Priority presets','Premium themes']},
  {name:'Team', price:'$49/mo', bullets:['Team licenses','SAML SSO','API access','Priority support']}
]

export default function Pricing(){
  return (
    <div>
      <h3>Pricing & Plans</h3>
      <p>Choose a plan that fits your needs. Pricing is illustrative for the demo.</p>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        {PLANS.map((p,idx)=> (
          <div key={idx} className="card" style={{flex:1}}>
            <h4 style={{margin:0}}>{p.name}</h4>
            <div style={{fontSize:20,fontWeight:800,margin:'8px 0'}}>{p.price}</div>
            <ul>{p.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
            <div style={{marginTop:10}}><button className="small">Select</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
