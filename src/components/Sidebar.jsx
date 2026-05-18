import React from 'react';

export default function Sidebar({ algorithm, setAlgorithm }) {
  const getCategory = (algo) => {
    if (['bubble', 'merge', 'quick'].includes(algo)) return 'sorting';
    if (['linear', 'binary'].includes(algo)) return 'searching';
    if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algo)) return 'graph';
    if (['preorder', 'inorder', 'postorder'].includes(algo)) return 'tree';
    if (['fibonacci', 'knapsack'].includes(algo)) return 'dp';
    return 'sorting';
  };

  const handleCategoryClick = (category) => {
    switch (category) {
      case 'sorting': setAlgorithm('bubble'); break;
      case 'searching': setAlgorithm('linear'); break;
      case 'graph': setAlgorithm('bfs'); break;
      case 'tree': setAlgorithm('preorder'); break;
      case 'dp': setAlgorithm('fibonacci'); break;
      default: setAlgorithm('bubble');
    }
  };

  const currentCategory = getCategory(algorithm);

  return (
    <div>
      <div className="logo">
        AlgoViz Pro <span className="pro-badge">PRO</span>
      </div>
      <nav className="nav">
        {/* Sorting Category */}
        <button 
          className={currentCategory === 'sorting' ? 'active' : ''} 
          onClick={() => handleCategoryClick('sorting')}
        >
          Sorting Algorithms
        </button>
        {currentCategory === 'sorting' && (
          <div className="sub-menu">
            <button className={algorithm === 'bubble' ? 'sub-active' : ''} onClick={() => setAlgorithm('bubble')}>
              <span className="sub-dot" /> Bubble Sort
            </button>
            <button className={algorithm === 'merge' ? 'sub-active' : ''} onClick={() => setAlgorithm('merge')}>
              <span className="sub-dot" /> Merge Sort
            </button>
            <button className={algorithm === 'quick' ? 'sub-active' : ''} onClick={() => setAlgorithm('quick')}>
              <span className="sub-dot" /> Quick Sort
            </button>
          </div>
        )}

        {/* Searching Category */}
        <button 
          className={currentCategory === 'searching' ? 'active' : ''} 
          onClick={() => handleCategoryClick('searching')}
        >
          Search Algorithms
        </button>
        {currentCategory === 'searching' && (
          <div className="sub-menu">
            <button className={algorithm === 'linear' ? 'sub-active' : ''} onClick={() => setAlgorithm('linear')}>
              <span className="sub-dot" /> Linear Search
            </button>
            <button className={algorithm === 'binary' ? 'sub-active' : ''} onClick={() => setAlgorithm('binary')}>
              <span className="sub-dot" /> Binary Search
            </button>
          </div>
        )}

        {/* Graph Category */}
        <button 
          className={currentCategory === 'graph' ? 'active' : ''} 
          onClick={() => handleCategoryClick('graph')}
        >
          Graph Algorithms
        </button>
        {currentCategory === 'graph' && (
          <div className="sub-menu">
            <button className={algorithm === 'bfs' ? 'sub-active' : ''} onClick={() => setAlgorithm('bfs')}>
              <span className="sub-dot" /> Breadth-First (BFS)
            </button>
            <button className={algorithm === 'dfs' ? 'sub-active' : ''} onClick={() => setAlgorithm('dfs')}>
              <span className="sub-dot" /> Depth-First (DFS)
            </button>
            <button className={algorithm === 'dijkstra' ? 'sub-active' : ''} onClick={() => setAlgorithm('dijkstra')}>
              <span className="sub-dot" /> Dijkstra's Path
            </button>
            <button className={algorithm === 'prim' ? 'sub-active' : ''} onClick={() => setAlgorithm('prim')}>
              <span className="sub-dot" /> Prim's Spanning
            </button>
          </div>
        )}

        {/* Tree Category */}
        <button 
          className={currentCategory === 'tree' ? 'active' : ''} 
          onClick={() => handleCategoryClick('tree')}
        >
          Tree Traversal
        </button>
        {currentCategory === 'tree' && (
          <div className="sub-menu">
            <button className={algorithm === 'preorder' ? 'sub-active' : ''} onClick={() => setAlgorithm('preorder')}>
              <span className="sub-dot" /> Pre-order Traversal
            </button>
            <button className={algorithm === 'inorder' ? 'sub-active' : ''} onClick={() => setAlgorithm('inorder')}>
              <span className="sub-dot" /> In-order Traversal
            </button>
            <button className={algorithm === 'postorder' ? 'sub-active' : ''} onClick={() => setAlgorithm('postorder')}>
              <span className="sub-dot" /> Post-order Traversal
            </button>
          </div>
        )}

        {/* Dynamic Programming Category */}
        <button 
          className={(currentCategory === 'dp' ? 'active ' : '') + 'premium'} 
          onClick={() => handleCategoryClick('dp')}
          title="Premium DP Suites"
        >
          Dynamic Programming
        </button>
        {currentCategory === 'dp' && (
          <div className="sub-menu">
            <button className={algorithm === 'fibonacci' ? 'sub-active' : ''} onClick={() => setAlgorithm('fibonacci')}>
              <span className="sub-dot" /> Fibonacci Memoization
            </button>
            <button className={algorithm === 'knapsack' ? 'sub-active' : ''} onClick={() => setAlgorithm('knapsack')}>
              <span className="sub-dot" /> 0/1 Knapsack Grid
            </button>
          </div>
        )}
      </nav>
      <div style={{ marginTop: 18 }}>
        <small style={{ color: '#94a3b8' }}>Visualizer HUD:</small>
        <div style={{ marginTop: 8 }} className="card">
          Active: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{algorithm.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
