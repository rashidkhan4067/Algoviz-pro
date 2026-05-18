import React from 'react'

function CopyButton({text, label='Copy'}){
  async function copy(){
    try{ await navigator.clipboard.writeText(text); alert('Copied to clipboard') }catch(e){ alert('Copy failed') }
  }
  return <button className="small" onClick={copy}>{label}</button>
}

export default function Explore(){
  const sampleGraph = JSON.stringify({graph:{0:{1:4,2:1},1:{3:1},2:{1:2,3:5},3:{}},start:0}, null, 2)
  const sampleTree = JSON.stringify({tree:{A:['B','C'],B:['D','E'],C:['F'],D:[],E:[],F:[]},start:'A'}, null, 2)
  return (
    <div>
      <h3>Explore — Sample Datasets & Presets</h3>
      <p>Quickly experiment with production-like datasets and presets. Use the manual input in Controls to paste any of the payloads below and click <strong>Apply</strong>.</p>

      <section style={{marginTop:12}}>
        <h4>Graph — Weighted Example</h4>
        <pre style={{whiteSpace:'pre-wrap',background:'rgba(255,255,255,0.02)',padding:12,borderRadius:8}}>{sampleGraph}</pre>
        <div style={{marginTop:8}}>
          <CopyButton text={sampleGraph} label="Copy Graph JSON" />
        </div>
      </section>

      <section style={{marginTop:18}}>
        <h4>Tree — Level-Order Example</h4>
        <pre style={{whiteSpace:'pre-wrap',background:'rgba(255,255,255,0.02)',padding:12,borderRadius:8}}>{sampleTree}</pre>
        <div style={{marginTop:8}}>
          <CopyButton text={sampleTree} label="Copy Tree JSON" />
        </div>
      </section>

      <section style={{marginTop:18}}>
        <h4>Tips</h4>
        <ul>
          <li>Graphs accept adjacency maps: node -&gt; <code>{`{"neighbor": weight}`}</code>.</li>
          <li>Trees accept adjacency maps: node -&gt; <code>{`[childrenNames]`}</code>.</li>
          <li>For quick tests you can paste space/comma-separated node lists (Controls will build defaults).</li>
        </ul>
      </section>
    </div>
  )
}
