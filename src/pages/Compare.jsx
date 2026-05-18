import React, { useState, useEffect, useRef } from 'react';
import './Compare.css';

const API_BASE = 'http://localhost:5000/api';

const ALGO_METRICS = {
  bubble: { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', desc: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.' },
  quick: { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', desc: 'Divides array using a pivot element, partitioning other elements into two sub-arrays.' },
  merge: { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', desc: 'Recursively divides the array into halves, sorts them, and merges them back together.' },
  bfs: { name: 'Breadth-First Search', best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)', desc: 'Explores all neighbor nodes at the present depth level before moving to nodes at the next depth level.' },
  dfs: { name: 'Depth-First Search', best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)', desc: 'Explores as far as possible along each branch before backtracking.' }
};

const SAMPLE_ARRAYS = {
  random: [45, 12, 85, 32, 64, 25, 90, 8, 55, 70],
  sorted: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  reversed: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10],
  almost: [10, 20, 40, 30, 50, 60, 80, 70, 90, 100]
};

const SAMPLE_GRAPH = {
  graph: {
    "0": {"1": 1, "2": 1},
    "1": {"3": 1, "4": 1},
    "2": {"5": 1},
    "3": {},
    "4": {"5": 1},
    "5": {}
  },
  start: "0"
};

export default function Compare() {
  const [category, setCategory] = useState('sorting'); // 'sorting' | 'graph'
  const [algoLeft, setAlgoLeft] = useState('bubble');
  const [algoRight, setAlgoRight] = useState('quick');
  
  // Input states
  const [arrayPreset, setArrayPreset] = useState('random');
  const [customArrayStr, setCustomArrayStr] = useState('45, 12, 85, 32, 64, 25, 90, 8, 55, 70');
  
  // Execution states
  const [stepsLeft, setStepsLeft] = useState([]);
  const [stepsRight, setStepsRight] = useState([]);
  const [currentLeft, setCurrentLeft] = useState(0);
  const [currentRight, setCurrentRight] = useState(0);
  
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per step
  
  // Performance counters
  const [comparisonsLeft, setComparisonsLeft] = useState(0);
  const [swapsLeft, setSwapsLeft] = useState(0);
  const [comparisonsRight, setComparisonsRight] = useState(0);
  const [swapsRight, setSwapsRight] = useState(0);
  
  const playTimer = useRef(null);

  // Sync left and right selectors based on category
  useEffect(() => {
    if (category === 'sorting') {
      setAlgoLeft('bubble');
      setAlgoRight('quick');
    } else {
      setAlgoLeft('bfs');
      setAlgoRight('dfs');
    }
    stopSimulation();
    setStepsLeft([]);
    setStepsRight([]);
  }, [category]);

  const getArrayData = () => {
    if (arrayPreset === 'custom') {
      return customArrayStr
        .split(/[\s,]+/)
        .map(Number)
        .filter(x => !isNaN(x) && x > 0 && x <= 100);
    }
    return [...SAMPLE_ARRAYS[arrayPreset]];
  };

  const loadComparison = async () => {
    stopSimulation();
    
    try {
      let reqBodyLeft = {};
      let reqBodyRight = {};
      
      if (category === 'sorting') {
        const arr = getArrayData();
        reqBodyLeft = { array: [...arr] };
        reqBodyRight = { array: [...arr] };
      } else {
        reqBodyLeft = { graph: SAMPLE_GRAPH.graph, start: SAMPLE_GRAPH.start };
        reqBodyRight = { graph: SAMPLE_GRAPH.graph, start: SAMPLE_GRAPH.start };
      }

      const [resLeft, resRight] = await Promise.all([
        fetch(`${API_BASE}/algorithm/${algoLeft}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBodyLeft)
        }),
        fetch(`${API_BASE}/algorithm/${algoRight}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBodyRight)
        })
      ]);

      if (!resLeft.ok || !resRight.ok) {
        throw new Error('One or both algorithm requests failed');
      }

      const dataLeft = await resLeft.json();
      const dataRight = await resRight.json();

      setStepsLeft(dataLeft.steps || []);
      setStepsRight(dataRight.steps || []);
      setCurrentLeft(0);
      setCurrentRight(0);
      
      // Reset metrics
      setComparisonsLeft(0);
      setSwapsLeft(0);
      setComparisonsRight(0);
      setSwapsRight(0);
      
    } catch (err) {
      console.error('Failed to load comparison data', err);
      alert('Error fetching algorithm comparisons from the backend. Make sure app.py is running on port 5000!');
    }
  };

  const stopSimulation = () => {
    setPlaying(false);
    if (playTimer.current) {
      clearInterval(playTimer.current);
      playTimer.current = null;
    }
  };

  const startSimulation = () => {
    if (!stepsLeft.length || !stepsRight.length) {
      alert('Please load the comparison datasets first by clicking "Load Comparison"');
      return;
    }
    setPlaying(true);
  };

  // Step ticking loop
  useEffect(() => {
    if (!playing) return;

    playTimer.current = setInterval(() => {
      let finishedLeft = false;
      let finishedRight = false;

      // Advance Left Algorithm
      setCurrentLeft(prev => {
        if (prev >= stepsLeft.length - 1) {
          finishedLeft = true;
          return prev;
        }
        const next = prev + 1;
        // Count comparisons & swaps dynamically
        const step = stepsLeft[next];
        if (step) {
          if (step.type === 'compare') setComparisonsLeft(c => c + 1);
          if (step.type === 'swap' || step.type === 'swap_indices') setSwapsLeft(s => s + 1);
        }
        return next;
      });

      // Advance Right Algorithm
      setCurrentRight(prev => {
        if (prev >= stepsRight.length - 1) {
          finishedRight = true;
          return prev;
        }
        const next = prev + 1;
        // Count comparisons & swaps dynamically
        const step = stepsRight[next];
        if (step) {
          if (step.type === 'compare') setComparisonsRight(c => c + 1);
          if (step.type === 'swap' || step.type === 'swap_indices') setSwapsRight(s => s + 1);
        }
        return next;
      });

      if (finishedLeft && finishedRight) {
        stopSimulation();
      }
    }, speed);

    return () => {
      if (playTimer.current) {
        clearInterval(playTimer.current);
      }
    };
  }, [playing, stepsLeft, stepsRight, speed]);

  const handleStepReset = () => {
    stopSimulation();
    setCurrentLeft(0);
    setCurrentRight(0);
    setComparisonsLeft(0);
    setSwapsLeft(0);
    setComparisonsRight(0);
    setSwapsRight(0);
  };

  // Retrieve current active steps safely
  const stepLeft = stepsLeft[currentLeft] || null;
  const stepRight = stepsRight[currentRight] || null;

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h2 className="title-glow">Algorithm Arena — Side-by-Side</h2>
        <p className="subtitle">Witness, evaluate, and benchmark different algorithms working simultaneously on the exact same structure.</p>
      </div>

      {/* Arena Configuration Controls */}
      <div className="arena-controls">
        <div className="controls-row">
          <div className="control-group">
            <label>Visual Category</label>
            <div className="pill-group">
              <button 
                className={`pill-btn ${category === 'sorting' ? 'active' : ''}`}
                onClick={() => setCategory('sorting')}
              >
                Sorting Arrays
              </button>
              <button 
                className={`pill-btn ${category === 'graph' ? 'active' : ''}`}
                onClick={() => setCategory('graph')}
              >
                Graph Traversals
              </button>
            </div>
          </div>

          <div className="control-group">
            <label>Compare Left</label>
            <select 
              className="arena-select"
              value={algoLeft} 
              onChange={e => { setAlgoLeft(e.target.value); handleStepReset(); }}
            >
              {category === 'sorting' ? (
                <>
                  <option value="bubble">Bubble Sort</option>
                  <option value="quick">Quick Sort</option>
                  <option value="merge">Merge Sort</option>
                </>
              ) : (
                <>
                  <option value="bfs">Breadth-First Search (BFS)</option>
                  <option value="dfs">Depth-First Search (DFS)</option>
                </>
              )}
            </select>
          </div>

          <div className="control-group">
            <label>Compare Right</label>
            <select 
              className="arena-select"
              value={algoRight}
              onChange={e => { setAlgoRight(e.target.value); handleStepReset(); }}
            >
              {category === 'sorting' ? (
                <>
                  <option value="bubble">Bubble Sort</option>
                  <option value="quick">Quick Sort</option>
                  <option value="merge">Merge Sort</option>
                </>
              ) : (
                <>
                  <option value="bfs">Breadth-First Search (BFS)</option>
                  <option value="dfs">Depth-First Search (DFS)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {category === 'sorting' && (
          <div className="controls-row" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <div className="control-group">
              <label>Dataset Preset</label>
              <select 
                className="arena-select"
                value={arrayPreset}
                onChange={e => setArrayPreset(e.target.value)}
              >
                <option value="random">Random Shuffled</option>
                <option value="sorted">Sorted ascending</option>
                <option value="reversed">Reversed descending</option>
                <option value="almost">Almost Sorted</option>
                <option value="custom">Custom Input Array</option>
              </select>
            </div>

            {arrayPreset === 'custom' && (
              <div className="control-group" style={{ flexGrow: 1 }}>
                <label>Values (comma separated, max 100)</label>
                <input 
                  type="text" 
                  className="arena-input"
                  value={customArrayStr} 
                  onChange={e => setCustomArrayStr(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="action-row">
          <button className="primary-btn glow-cyan" onClick={loadComparison}>
            Load Comparison Data
          </button>

          {playing ? (
            <button className="secondary-btn" onClick={stopSimulation}>Pause</button>
          ) : (
            <button className="secondary-btn glow-green" onClick={startSimulation} disabled={!stepsLeft.length}>
              Start Side-by-Side
            </button>
          )}

          <button className="secondary-btn" onClick={handleStepReset}>Reset</button>

          <div className="speed-slider-group">
            <span className="speed-label">Speed: {speed}ms</span>
            <input 
              type="range" 
              min="50" 
              max="1500" 
              step="50"
              value={speed} 
              onChange={e => setSpeed(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Main Comparative Viewport Panels */}
      <div className="comparison-viewport">
        {/* Left Side Visualizer */}
        <div className="visualizer-side left-side">
          <div className="side-header glow-border-left">
            <span className="badge badge-left">LEFT ENGINE</span>
            <h3>{ALGO_METRICS[algoLeft]?.name}</h3>
          </div>

          <div className="visualizer-stage">
            {category === 'sorting' ? (
              <SortingPanel 
                array={getArrayData()} 
                activeStep={stepLeft} 
              />
            ) : (
              <GraphTraversalPanel 
                activeStep={stepLeft} 
              />
            )}
          </div>

          <div className="step-progress-row">
            <span>Step {currentLeft + 1} of {stepsLeft.length || 1}</span>
            <div className="progress-bar-bg">
              <div 
                className="progress-fill fill-left"
                style={{ width: `${stepsLeft.length ? ((currentLeft + 1) / stepsLeft.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="telemetry-grid">
            <div className="tel-card">
              <span className="tel-label">Comparisons</span>
              <span className="tel-value glow-text-yellow">{comparisonsLeft}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Swaps/Operations</span>
              <span className="tel-value glow-text-cyan">{swapsLeft}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Time Complexity</span>
              <span className="tel-value font-mono">{ALGO_METRICS[algoLeft]?.avg}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Space Complexity</span>
              <span className="tel-value font-mono">{ALGO_METRICS[algoLeft]?.space}</span>
            </div>
          </div>

          <p className="algo-description">{ALGO_METRICS[algoLeft]?.desc}</p>
        </div>

        {/* Right Side Visualizer */}
        <div className="visualizer-side right-side">
          <div className="side-header glow-border-right">
            <span className="badge badge-right">RIGHT ENGINE</span>
            <h3>{ALGO_METRICS[algoRight]?.name}</h3>
          </div>

          <div className="visualizer-stage">
            {category === 'sorting' ? (
              <SortingPanel 
                array={getArrayData()} 
                activeStep={stepRight} 
              />
            ) : (
              <GraphTraversalPanel 
                activeStep={stepRight} 
              />
            )}
          </div>

          <div className="step-progress-row">
            <span>Step {currentRight + 1} of {stepsRight.length || 1}</span>
            <div className="progress-bar-bg">
              <div 
                className="progress-fill fill-right"
                style={{ width: `${stepsRight.length ? ((currentRight + 1) / stepsRight.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="telemetry-grid">
            <div className="tel-card">
              <span className="tel-label">Comparisons</span>
              <span className="tel-value glow-text-yellow">{comparisonsRight}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Swaps/Operations</span>
              <span className="tel-value glow-text-cyan">{swapsRight}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Time Complexity</span>
              <span className="tel-value font-mono">{ALGO_METRICS[algoRight]?.avg}</span>
            </div>
            <div className="tel-card">
              <span className="tel-label">Space Complexity</span>
              <span className="tel-value font-mono">{ALGO_METRICS[algoRight]?.space}</span>
            </div>
          </div>

          <p className="algo-description">{ALGO_METRICS[algoRight]?.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* Internal Visualizing Sub-Components for Arena */
function SortingPanel({ array, activeStep }) {
  const currentArray = activeStep ? (activeStep.array || array) : array;
  const indices = activeStep ? (activeStep.indices || []) : [];
  const type = activeStep ? activeStep.type : '';

  return (
    <div className="compare-sorting-arena">
      {currentArray.map((val, idx) => {
        let barClass = 'compare-bar';
        if (indices.includes(idx)) {
          if (type === 'swap' || type === 'swap_indices') {
            barClass += ' state-swap';
          } else if (type === 'compare') {
            barClass += ' state-compare';
          } else {
            barClass += ' state-active';
          }
        }

        return (
          <div key={idx} className="compare-bar-wrapper">
            <div 
              className={barClass} 
              style={{ height: `${Math.max(val * 1.8, 15)}px` }}
            >
              <span className="bar-num">{val}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GraphTraversalPanel({ activeStep }) {
  // Renders queue/stack contents and linear traversal path dynamically
  const meta = activeStep ? activeStep.meta : null;
  const activeNode = meta ? meta.current : null;
  const visited = meta && meta.visited ? meta.visited : [];
  const structItems = meta ? (meta.queue || meta.stack || []) : [];
  const isQueue = meta && meta.queue !== undefined;

  return (
    <div className="compare-graph-arena">
      <div className="traversal-nodes-row">
        <span className="arena-sublabel">Nodes Visited (Order)</span>
        <div className="visited-nodes-trail">
          {visited.length === 0 ? (
            <span className="placeholder-text">Click Start to begin traversal...</span>
          ) : (
            visited.map((n, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="trail-arrow">→</span>}
                <div className={`trail-node-dot ${n === activeNode ? 'glowing' : ''}`}>
                  {n}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <div className="traversal-struct-row">
        <span className="arena-sublabel">
          {isQueue ? 'Active Queue (FIFO)' : 'Active Stack (LIFO)'}
        </span>
        <div className="data-struct-visualizer">
          {structItems.length === 0 ? (
            <span className="placeholder-text">Structure is empty.</span>
          ) : (
            structItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`struct-item-card ${isQueue ? 'item-queue' : 'item-stack'}`}
              >
                <span className="struct-item-val">{item}</span>
                {idx === 0 && <span className="struct-item-tip">{isQueue ? 'Front' : 'Top'}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
