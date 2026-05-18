import React from 'react'

export default function Docs(){
  return (
    <div>
      <h3>Documentation — API & Data Contracts</h3>
      <p>This reference describes the backend API and the JSON formats the visualizer expects.</p>

      <h4>Endpoint</h4>
      <pre>/api/algorithm/&lt;name&gt;  (POST)</pre>
      <p>Replace &lt;name&gt; with algorithm key: <code>bubble, merge, quick, linear, binary, bfs, dfs, dijkstra, prim, preorder, inorder, postorder, fibonacci, knapsack</code>.</p>

      <h4>Body</h4>
      <p>Depending on algorithm, body should include one of:</p>
      <ul>
        <li><strong>Sorting / Searching</strong>: <code>{'{ "array": [5,3,1,4] }'}</code></li>
        <li><strong>Graph algorithms</strong>: adjacency map, e.g. <code>{'{ "graph": { "0": {"1":4}, "1":{} }, "start": 0 }'}</code></li>
        <li><strong>Tree traversals</strong>: adjacency map, e.g. <code>{'{ "tree": { "A": ["B","C"], "B":[], "C":[] }, "start": "A" }'}</code></li>
        <li><strong>Fibonacci</strong>: <code>{'{ "n": 10 }'}</code></li>
        <li><strong>Knapsack</strong>: <code>{'{ "weights": [2,3], "values": [3,4], "capacity": 5 }'}</code></li>
      </ul>

      <h4>Response</h4>
      <p>Successful response returns a JSON object with keys such as:</p>
      <ul>
        <li><code>steps</code>: an ordered array of step objects for visualization</li>
        <li><code>array</code>: for sorting/search responses</li>
        <li><code>graph</code> / <code>tree</code>: the normalized input structure</li>
        <li><code>start</code>: start node for graph/tree</li>
      </ul>

      <h4>Step object format</h4>
      <pre style={{whiteSpace:'pre-wrap',background:'rgba(255,255,255,0.02)',padding:12,borderRadius:8}}>{`{
  type: 'visit' | 'discover' | 'update' | 'compare' | 'swap' | 'init' | 'complete' | ...,
  indices: [nodeOrIndex,...],
  array?: [...],
  meta?: { distances?: {node: number}, visited?: [...], ... }
}`}</pre>

      <h4>Best practices</h4>
      <ul>
        <li>Prefer string node ids (frontend normalizes to strings).</li>
        <li>Keep graphs small (&lt; 30 nodes) when debugging; step count grows quickly for dense graphs.</li>
        <li>Use adjacency maps for weighted algorithms (Dijkstra &amp; Prim).</li>
      </ul>
    </div>
  )
}
