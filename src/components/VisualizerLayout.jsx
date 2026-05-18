import React from 'react';
import Sidebar from './Sidebar';
import Visualization from './Visualization';
import Controls from './Controls';
import CodePanel from './CodePanel';
import PerformancePanel from './PerformancePanel';

export default function VisualizerLayout({
  algorithm,
  setAlgorithm,
  array,
  setArray,
  data,
  size,
  setSize,
  steps,
  current,
  setCurrent,
  playing,
  setPlaying,
  speed,
  setSpeed,
  visTheme,
  setVisTheme,
  loadAlgorithm,
  describeStepDetailed,
  ALGO_INFO,
}) {
  const dynamicStats = (() => {
    let compares = 0;
    let swaps = 0;
    let overwrites = 0;
    for (let i = 0; i <= current; i++) {
      const s = steps[i];
      if (s) {
        if (s.type === 'compare') compares++;
        if (s.type === 'swap') swaps++;
        if (s.type === 'overwrite') overwrites++;
      }
    }
    const progress = steps.length ? Math.round(((current + 1) / steps.length) * 100) : 0;
    return { compares, swaps, overwrites, progress };
  })();

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Sidebar algorithm={algorithm} setAlgorithm={setAlgorithm} />
      </aside>
      <section className="content-card">
        <div className="breadcrumbs">
          Algorithms ›
          {['bubble', 'merge', 'quick'].includes(algorithm) ? 'Sorting' :
           ['linear', 'binary'].includes(algorithm) ? 'Searching' :
           ['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm) ? 'Graph' :
           ['preorder', 'inorder', 'postorder'].includes(algorithm) ? 'Tree Traversal' : 'DP'} ›
          {algorithm === 'bubble' ? 'Bubble Sort' :
           algorithm === 'merge' ? 'Merge Sort' :
           algorithm === 'quick' ? 'Quick Sort' :
           algorithm === 'linear' ? 'Linear Search' :
           algorithm === 'binary' ? 'Binary Search' :
           algorithm === 'bfs' ? 'Breadth-First Search' :
           algorithm === 'dfs' ? 'Depth-First Search' :
           algorithm === 'dijkstra' ? "Dijkstra's Algorithm" :
           algorithm === 'prim' ? "Prim's Algorithm" :
           algorithm === 'preorder' ? 'Pre-order Traversal' :
           algorithm === 'inorder' ? 'In-order Traversal' :
           algorithm === 'postorder' ? 'Post-order Traversal' :
           algorithm === 'fibonacci' ? 'Fibonacci Sequence' : 'Knapsack Problem'}
        </div>
        <div className={`viz theme-${visTheme}`}>
          <Visualization 
            algorithm={algorithm} 
            array={array} 
            data={data} 
            step={steps[current]} 
            visTheme={visTheme} 
            stats={dynamicStats} 
          />
        </div>
        <div className="controls-footer">
          <Controls
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            array={array}
            setArray={setArray}
            size={size}
            setSize={setSize}
            loadAlgorithm={loadAlgorithm}
            playing={playing}
            setPlaying={setPlaying}
            current={current}
            setCurrent={setCurrent}
            max={steps.length - 1}
            speed={speed}
            setSpeed={setSpeed}
            visTheme={visTheme}
            setVisTheme={setVisTheme}
            data={data}
          />
        </div>
      </section>
      <aside className="right-panel">
        <div className="card">
          <h3>What’s Happening</h3>
          <div className="breakdown">{steps[current] ? describeStepDetailed(steps[current]) : 'No steps loaded.'}</div>
        </div>
        <PerformancePanel steps={steps} speed={speed} />
        <div className="card">
          <h3>Legend</h3>
          <div className="legend-list">
            <div className="legend-item"><span className="legend-dot compare" />Compare</div>
            <div className="legend-item"><span className="legend-dot swap" />Swap</div>
            <div className="legend-item"><span className="legend-dot overwrite" />Write</div>
            <div className="legend-item"><span className="legend-dot pivot" />Pivot</div>
            <div className="legend-item"><span className="legend-dot sorted" />Sorted region</div>
          </div>
        </div>
        <div className="card">
          <h3>Algorithm Insights</h3>
          <div className="insights">
            <div><span>Best</span><strong>{ALGO_INFO[algorithm].best}</strong></div>
            <div><span>Average</span><strong>{ALGO_INFO[algorithm].average}</strong></div>
            <div><span>Worst</span><strong>{ALGO_INFO[algorithm].worst}</strong></div>
            <div><span>Stable</span><strong>{ALGO_INFO[algorithm].stable}</strong></div>
            <div><span>In-place</span><strong>{ALGO_INFO[algorithm].in_place}</strong></div>
            <div className="idea"><span>Idea</span><strong>{ALGO_INFO[algorithm].idea}</strong></div>
          </div>
        </div>
        <div className="card codepanel">
          <CodePanel algorithm={algorithm} highlightLine={steps[current]?.line} />
        </div>
      </aside>
    </div>
  );
}
