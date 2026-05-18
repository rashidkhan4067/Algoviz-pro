import React from 'react'

const CODES = {
  bubble: `1 for i in range(n):\n2     for j in range(0, n - i - 1):\n3         if a[j] > a[j+1]:\n4             swap(a, j, j+1)`,
  merge: `1 def merge_sort(l, r):\n2     if r - l <= 1: return\n3     m = (l + r)//2\n4     merge_sort(l, m)\n5     merge_sort(m, r)\n6     merge(...)` ,
  quick: `1 def quick(l, r):\n2     if l < r:\n3         p = partition(l, r)\n4         quick(l, p)\n5         quick(p+1, r)`
  ,
  bfs: `1 function bfs(graph, start):\n2     queue = [start]\n3     visited = set()\n4     while queue:\n5         node = queue.pop(0)\n6         if node not in visited:\n7             visit(node)\n8             for neighbor in graph[node]:\n9                 if neighbor not in visited: queue.append(neighbor)`,
  dfs: `1 function dfs(graph, start):\n2     stack = [start]\n3     visited = set()\n4     while stack:\n5         node = stack.pop()\n6         if node not in visited:\n7             visit(node)\n8             for neighbor in reversed(graph[node]): stack.append(neighbor)`,
  dijkstra: `1 function dijkstra(graph, start):\n2     dist = {v: inf for v in graph}\n3     dist[start]=0\n4     visited = set()\n5     while unvisited nodes exist:\n6         u = node with smallest dist\n7         visited.add(u)\n8         for v,w in graph[u].items():\n9             if dist[u]+w < dist[v]:\n10                dist[v]=dist[u]+w`,
  prim: `1 function prim(graph, start):\n2     visited = {start}\n3     edges = all edges from start\n4     while edges and visited != all nodes:\n5         pick min weight edge (u,v)\n6         if v not in visited: add to mst and add edges from v`,
  preorder: `1 function preorder(node):\n2     if node is None: return\n3     visit(node)\n4     for child in children(node): preorder(child)`,
  inorder: `1 function inorder(node):\n2     if node is None: return\n3     inorder(left(node))\n4     visit(node)\n5     inorder(right(node))`,
  postorder: `1 function postorder(node):\n2     if node is None: return\n3     for child in children(node): postorder(child)\n4     visit(node)`
}

export default function CodePanel({algorithm, highlightLine}){
  const code = CODES[algorithm] || ''
  const lines = code.split('\n')
  return (
    <div className="codepanel">
      <h3>Code</h3>
      <pre>
        {lines.map((ln, idx)=> {
          const parts = ln.split(' ')
          const lineNum = parts[0].match(/^\d+$/) ? Number(parts[0]) : idx+1
          const text = parts.slice(1).join(' ')
          return (
            <div key={idx} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <div style={{width:28,opacity:0.6}}>{lineNum}</div>
              <div className={highlightLine === lineNum ? 'highlight' : ''} style={{flex:1}}>{text}</div>
            </div>
          )
        })}
      </pre>
      <div className="code-actions">
        <button onClick={()=>navigator.clipboard?.writeText(code)}>Copy Code</button>
      </div>
    </div>
  )
}
