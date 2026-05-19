import React from 'react'

const POSTS = [
  {title:'Visualizing Dijkstra — internals and optimizations',excerpt:'Deep dive into Dijkstra implementation, priority queue choices, and step reduction techniques.'},
  {title:'Designing interactive algorithm animations',excerpt:'Patterns for smooth transitions, pacing strategies, and reducing cognitive load in educational UIs.'},
  {title:'Scaling visualizations for larger graphs',excerpt:'Techniques to abstract, cluster, and sample large graph inputs for meaningful visualization.'}
]

export default function Blog(){
  return (
    <div>
      <h3>Blog — Advanced Articles</h3>
      <p>Curated technical articles for engineers and educators.</p>
      <div style={{marginTop:12}}>
        {POSTS.map((p,idx)=> (
          <article key={idx} className="card" style={{marginBottom:10,padding:12}}>
            <h4 style={{margin:'0 0 6px 0'}}>{p.title}</h4>
            <p style={{margin:0,color:'#cbd5e1'}}>{p.excerpt}</p>
            <div style={{marginTop:8}}><button className="small">Read</button></div>
          </article>
        ))}
      </div>
    </div>
  )
}
