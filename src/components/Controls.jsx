import React, { useState, useEffect, useMemo } from 'react';
import './Controls.css';

const GRAPH_PRESETS = {
  sample: {
    graph: {
      "0": {"1": 4, "2": 1},
      "1": {"3": 1},
      "2": {"1": 2, "3": 5},
      "3": {}
    },
    start: "0"
  },
  cyclic: {
    graph: {
      "A": {"B": 2, "C": 5},
      "B": {"C": 1, "D": 3},
      "C": {"D": 1},
      "D": {"A": 4}
    },
    start: "A"
  },
  star: {
    graph: {
      "Center": {"Node1": 2, "Node2": 3, "Node3": 4, "Node4": 1},
      "Node1": {"Center": 2},
      "Node2": {"Center": 3},
      "Node3": {"Center": 4},
      "Node4": {"Center": 1}
    },
    start: "Center"
  },
  disconnected: {
    graph: {
      "A": {"B": 3},
      "B": {"A": 3},
      "C": {"D": 4},
      "D": {"C": 4}
    },
    start: "A"
  }
};

const TREE_PRESETS = {
  binary: {
    tree: {
      "50": ["30", "70"],
      "30": ["20", "40"],
      "70": ["60", "80"],
      "20": [],
      "40": [],
      "60": [],
      "80": []
    },
    start: "50"
  },
  skewed: {
    tree: {
      "A": ["B"],
      "B": ["C"],
      "C": ["D"],
      "D": []
    },
    start: "A"
  }
};

export default function Controls({
  algorithm,
  setAlgorithm,
  array,
  setArray,
  size,
  setSize,
  loadAlgorithm,
  playing,
  setPlaying,
  current,
  setCurrent,
  max,
  speed,
  setSpeed,
  visTheme,
  setVisTheme,
  data
}) {
  const hasSteps = max >= 0;

  // Sound Toggle state
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('algoview_sound_enabled') !== 'false'
  );

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('algoview_sound_enabled', String(nextVal));
  };

  // Speed Presets
  const setSpeedPreset = (val) => {
    setSpeed(val);
  };

  // Target Key state for Search Algorithms
  const [searchTarget, setSearchTarget] = useState('42');
  const triggerSearchLoad = (targetVal = searchTarget) => {
    const parsed = Number(targetVal);
    if (!isNaN(parsed)) {
      setPlaying(false);
      loadAlgorithm({
        array: array,
        target: parsed
      }, algorithm);
    }
  };

  // Randomizer boundaries state
  const [minBound, setMinBound] = useState(10);
  const [maxBound, setMaxBound] = useState(95);

  const triggerRandomize = () => {
    const minVal = Math.min(Number(minBound) || 5, Number(maxBound) || 99);
    const maxVal = Math.max(Number(minBound) || 5, Number(maxBound) || 99);
    const randomArr = Array.from({ length: size }, () => 
      Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
    );
    setPlaying(false);
    loadAlgorithm(randomArr);
  };

  // Start Node configuration state
  const [startNode, setStartNode] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('sample');

  // Auto-init start node state based on selected presets
  useEffect(() => {
    if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm)) {
      setStartNode('0');
      setSelectedPreset('sample');
    } else if (['preorder', 'inorder', 'postorder'].includes(algorithm)) {
      setStartNode('50');
      setSelectedPreset('binary');
    }
  }, [algorithm]);

  const triggerStartNodeUpdate = (nodeStr = startNode) => {
    setPlaying(false);
    if (['preorder', 'inorder', 'postorder'].includes(algorithm)) {
      const activeTree = data || TREE_PRESETS.binary.tree;
      loadAlgorithm({
        tree: activeTree, 
        start: nodeStr.trim()
      }, algorithm);
    } else if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm)) {
      const activeGraph = data || GRAPH_PRESETS.sample.graph;
      loadAlgorithm({
        graph: activeGraph, 
        start: nodeStr.trim()
      }, algorithm);
    }
  };

  // DP parameters states
  const [fibTerms, setFibTerms] = useState(10);
  const [knapCapacity, setKnapCapacity] = useState(8);
  const [knapWeights, setKnapWeights] = useState('2, 3, 4, 5');
  const [knapValues, setKnapValues] = useState('3, 4, 8, 10');

  const triggerFibonacciLoad = (terms = fibTerms) => {
    const parsed = Number(terms);
    if (parsed >= 3 && parsed <= 30) {
      setPlaying(false);
      loadAlgorithm({ n: parsed }, 'fibonacci');
    }
  };

  const triggerKnapsackLoad = () => {
    const parsedW = knapWeights.split(/[\s,]+/).map(Number).filter(x => !isNaN(x) && x > 0);
    const parsedV = knapValues.split(/[\s,]+/).map(Number).filter(x => !isNaN(x) && x > 0);
    const cap = Math.max(1, Math.min(40, Number(knapCapacity) || 5));
    if (parsedW.length && parsedV.length) {
      setPlaying(false);
      loadAlgorithm({
        weights: parsedW,
        values: parsedV,
        capacity: cap
      }, 'knapsack');
    }
  };

  // Navigation callbacks
  function togglePlay() { if (hasSteps) setPlaying(!playing); }
  function stepForward() {
    if (!hasSteps) return;
    setCurrent(c => Math.min(c + 1, Math.max(0, max)));
  }
  function stepBack() { setCurrent(c => Math.max(0, c - 1)); }
  function stepStart() { setCurrent(0); }
  function stepEnd() { if (hasSteps) setCurrent(Math.max(0, max)); }
  function reload() { setPlaying(false); loadAlgorithm(array, algorithm); }
  function setArrayAndLoad(arr) { setPlaying(false); loadAlgorithm(arr); }

  function nearlySorted() {
    const base = Array.from({ length: size }, (_, i) => i + 1);
    for (let k = 0; k < Math.max(1, Math.floor(size * 0.1)); k++) {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
    }
    setArrayAndLoad(base);
  }
  function descending() { setArrayAndLoad(Array.from({ length: size }, (_, i) => size - i)); }
  function ascending() { setArrayAndLoad(Array.from({ length: size }, (_, i) => i + 1)); }
  
  const [manual, setManual] = React.useState('');

  function applyManual() {
    if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm) || ['preorder', 'inorder', 'postorder'].includes(algorithm)) {
      try {
        const payload = JSON.parse(manual);
        if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm)) {
          if (payload && payload.graph) { setPlaying(false); loadAlgorithm(payload, algorithm); return; }
        } else {
          if (payload && payload.tree) { setPlaying(false); loadAlgorithm(payload, algorithm); return; }
        }
      } catch (e) {
        // Fallback
      }

      const tokens = manual.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
      if (!tokens.length) { return; }

      if (['preorder', 'inorder', 'postorder'].includes(algorithm)) {
        const tree = {};
        for (let i = 0; i < tokens.length; i++) {
          const left = 2 * i + 1, right = 2 * i + 2;
          const children = [];
          if (left < tokens.length) children.push(tokens[left]);
          if (right < tokens.length) children.push(tokens[right]);
          tree[tokens[i]] = children;
        }
        const payload = { tree, start: tokens[0] };
        setPlaying(false); loadAlgorithm(payload, algorithm);
        return;
      }

      if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm)) {
        const graph = {};
        for (let i = 0; i < tokens.length; i++) {
          graph[tokens[i]] = {};
        }
        for (let i = 0; i < tokens.length - 1; i++) {
          graph[tokens[i]][tokens[i + 1]] = 1;
        }
        const payload = { graph, start: tokens[0] };
        setPlaying(false); loadAlgorithm(payload, algorithm);
        return;
      }
      return;
    }

    const nums = manual.split(/[,\s]+/).map(x => Number(x)).filter(x => Number.isFinite(x));
    if (nums.length) { setArrayAndLoad(nums); }
  }

  // Label memo helper
  const algoLabel = useMemo(() => {
    switch(algorithm) {
      case 'bubble': return 'Bubble Sort';
      case 'merge': return 'Merge Sort';
      case 'quick': return 'Quick Sort';
      case 'linear': return 'Linear Search';
      case 'binary': return 'Binary Search';
      case 'bfs': return 'Breadth-First Search';
      case 'dfs': return 'Depth-First Search';
      case 'dijkstra': return "Dijkstra's Shortest Path";
      case 'prim': return "Prim's MST";
      case 'preorder': return 'Pre-order Traversal';
      case 'inorder': return 'In-order Traversal';
      case 'postorder': return 'Post-order Traversal';
      case 'fibonacci': return 'Fibonacci DP';
      case 'knapsack': return 'Knapsack DP';
      default: return algorithm;
    }
  }, [algorithm]);

  const hasArray = !['bfs', 'dfs', 'dijkstra', 'prim', 'preorder', 'inorder', 'postorder', 'fibonacci', 'knapsack'].includes(algorithm);

  return (
    <div className="controls-inner">
      {/* 🚀 Segment 1: Header Timeline Scrubber (Full Width, Balanced Space) */}
      <div className="controls-timeline-container">
        <div className="timeline-info">
          <span>Active State: <strong>{algoLabel}</strong></span>
          <span>Timeline: <strong>{hasSteps ? current + 1 : 0}</strong> / <strong>{Math.max(0, max + 1)}</strong> Steps</span>
        </div>
        <input 
          type="range" 
          className="timeline-scrubber"
          min={0} 
          max={Math.max(0, max)} 
          value={Math.min(current, Math.max(0, max))} 
          onChange={e => { setPlaying(false); setCurrent(Number(e.target.value)); }} 
          disabled={!hasSteps} 
        />
      </div>

      {/* 🛠️ Segment 2: Symmetry-Aligned Three Column Grid */}
      <div className="controls-grid">
        
        {/* Column A: Playback deck + Speed Timing */}
        <div className="controls-col">
          <h4>Simulation Engine</h4>
          <div className="config-card flex-between">
            <div className="playback-deck">
              <button title="Reset to start" onClick={stepStart} disabled={!hasSteps}>⏮</button>
              <button title="Previous Step" onClick={stepBack} disabled={!hasSteps}>◀</button>
              <button 
                className="play-pause" 
                title={playing ? 'Pause Simulation' : 'Start Simulation'} 
                onClick={togglePlay} 
                disabled={!hasSteps}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button title="Next Step" onClick={stepForward} disabled={!hasSteps}>▶</button>
              <button title="Skip to End" onClick={stepEnd} disabled={!hasSteps}>⏭</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button 
                className={`pill-btn sound-toggle ${soundEnabled ? 'active' : 'muted'}`} 
                title="Toggle Audio Feedback" 
                onClick={toggleSound}
                style={{ 
                  flex: 1, 
                  background: soundEnabled ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: soundEnabled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: soundEnabled ? 'var(--text-highlight)' : 'var(--text-muted)'
                }}
              >
                {soundEnabled ? '🔊 Sound On' : '🔇 Muted'}
              </button>
              <button className="pill-btn" title="Reload structure" onClick={reload} style={{ width: '38px', flex: 'none', justifyContent: 'center' }}>
                ⟲
              </button>
            </div>

            <div className="config-item" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '2px' }}>
              <div className="config-label-row">
                <span>Delay Speed</span>
                <strong>{speed}ms</strong>
              </div>
              <input 
                type="range" 
                className="config-slider"
                min={50} 
                max={1500} 
                value={speed} 
                onChange={e => setSpeed(Number(e.target.value))} 
              />
            </div>
            
            <div className="speed-presets">
              <button className="pill-btn" onClick={() => setSpeedPreset(1200)}>0.25x</button>
              <button className="pill-btn" onClick={() => setSpeedPreset(500)}>1.0x</button>
              <button className="pill-btn" onClick={() => setSpeedPreset(200)}>2.5x</button>
              <button className="pill-btn" onClick={() => setSpeedPreset(50)}>Turbo</button>
            </div>
          </div>
        </div>

        {/* Column B: Dynamic Variables & Parameters panel */}
        <div className="controls-col">
          <h4>Variables & Presets</h4>
          <div className="config-card flex-between">
            
            {/* Context A: Linear / Binary Search Key Target */}
            {['linear', 'binary'].includes(algorithm) && (
              <div className="config-item">
                <div className="config-label-row">
                  <span>Search Target Key</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input 
                    type="number" 
                    className="control-dropdown" 
                    value={searchTarget}
                    onChange={e => setSearchTarget(e.target.value)} 
                    style={{ flex: 1, padding: '6px 10px', height: '32px', background: '#090a10', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <button className="manual-btn" onClick={() => triggerSearchLoad()} style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}>Set Target</button>
                </div>
              </div>
            )}

            {/* Context B: Graph Start node & graph presets dropdown selectors */}
            {['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <div className="config-item">
                  <div className="config-label-row">
                    <span>Starting Node</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <input 
                      type="text" 
                      className="control-dropdown" 
                      placeholder="Node e.g. 0" 
                      value={startNode}
                      onChange={e => setStartNode(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', height: '32px', background: '#090a10', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <button className="manual-btn" onClick={() => triggerStartNodeUpdate()} style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}>Set Start</button>
                  </div>
                </div>

                <div className="config-item">
                  <div className="config-label-row">
                    <span>Graph Preset Map</span>
                  </div>
                  <select 
                    className="control-dropdown"
                    style={{ height: '32px', padding: '6px 10px', marginTop: '2px' }}
                    value={selectedPreset}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedPreset(val);
                      const p = GRAPH_PRESETS[val];
                      if (p) { 
                        setPlaying(false); 
                        setStartNode(p.start);
                        loadAlgorithm(p, algorithm); 
                      }
                    }}
                  >
                    <option value="sample">Weighted Grid</option>
                    <option value="cyclic">Cyclic Loop</option>
                    <option value="star">Star Hub Network</option>
                    <option value="disconnected">Disconnected Clusters</option>
                  </select>
                </div>
              </div>
            )}

            {/* Context C: Trees presets and selectors */}
            {['preorder', 'inorder', 'postorder'].includes(algorithm) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <div className="config-item">
                  <div className="config-label-row">
                    <span>Start Node (BST)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <input 
                      type="text" 
                      className="control-dropdown" 
                      placeholder="Root e.g. 50" 
                      value={startNode}
                      onChange={e => setStartNode(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', height: '32px', background: '#090a10', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <button className="manual-btn" onClick={() => triggerStartNodeUpdate()} style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}>Set</button>
                  </div>
                </div>

                <div className="config-item">
                  <div className="config-label-row">
                    <span>Tree Preset Struct</span>
                  </div>
                  <select 
                    className="control-dropdown"
                    style={{ height: '32px', padding: '6px 10px', marginTop: '2px' }}
                    value={selectedPreset}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedPreset(val);
                      const p = TREE_PRESETS[val];
                      if (p) { 
                        setPlaying(false); 
                        setStartNode(p.start);
                        loadAlgorithm(p, algorithm); 
                      }
                    }}
                  >
                    <option value="binary">Balanced BST</option>
                    <option value="skewed">Skewed Chain</option>
                  </select>
                </div>
              </div>
            )}

            {/* Context D: Fibonacci terms input config */}
            {algorithm === 'fibonacci' && (
              <div className="config-item" style={{ width: '100%' }}>
                <div className="config-label-row">
                  <span>Fibonacci N (Terms)</span>
                  <strong>{fibTerms} terms</strong>
                </div>
                <input 
                  type="range" 
                  className="config-slider" 
                  min={5} 
                  max={25} 
                  value={fibTerms} 
                  onChange={e => {
                    setFibTerms(Number(e.target.value));
                    triggerFibonacciLoad(e.target.value);
                  }}
                />
              </div>
            )}

            {/* Context E: Knapsack parameters dynamic inputs */}
            {algorithm === 'knapsack' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <div className="config-item">
                  <div className="config-label-row">
                    <span>Capacity (W)</span>
                    <strong>{knapCapacity}</strong>
                  </div>
                  <input 
                    type="range" 
                    className="config-slider" 
                    min={3} 
                    max={15} 
                    value={knapCapacity} 
                    onChange={e => setKnapCapacity(Number(e.target.value))}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <input 
                    type="text" 
                    placeholder="W: 2,3,4" 
                    title="Item Weights" 
                    value={knapWeights} 
                    onChange={e => setKnapWeights(e.target.value)} 
                    style={{ flex: 1, fontSize: '10px', padding: '6px', height: '30px', background: '#090a10', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '6px', outline: 'none' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="V: 3,4,8" 
                    title="Item Values" 
                    value={knapValues} 
                    onChange={e => setKnapValues(e.target.value)} 
                    style={{ flex: 1, fontSize: '10px', padding: '6px', height: '30px', background: '#090a10', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '6px', outline: 'none' }} 
                  />
                  <button className="manual-btn" onClick={triggerKnapsackLoad} style={{ height: '30px', padding: '0 8px', fontSize: '11px' }}>Apply</button>
                </div>
              </div>
            )}

            {/* Context F: Default Sorting randomizer parameters */}
            {hasArray && !['linear', 'binary'].includes(algorithm) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Min Value</span>
                  <input 
                    type="number" 
                    className="bounds-input"
                    value={minBound} 
                    onChange={e => setMinBound(Number(e.target.value))} 
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Value</span>
                  <input 
                    type="number" 
                    className="bounds-input"
                    value={maxBound} 
                    onChange={e => setMaxBound(Number(e.target.value))} 
                  />
                </div>

                <div className="preset-row">
                  <button className="pill-btn" onClick={triggerRandomize} style={{ flex: 2 }}>🎲 Randomize</button>
                  <button className="pill-btn" onClick={ascending} title="Ascending Array">↑</button>
                  <button className="pill-btn" onClick={descending} title="Descending Array">↓</button>
                  <button className="pill-btn" onClick={nearlySorted} title="Nearly Sorted Array">≈</button>
                </div>
              </div>
            )}

            {/* Array Size slider & Visual Style selector dynamically appended inside variables config card */}
            {hasArray && (
              <div className="config-item" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  <div className="config-label-row">
                    <span>Visual Style</span>
                  </div>
                  <select 
                    className="control-dropdown"
                    value={visTheme}
                    onChange={e => setVisTheme(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '28px', 
                      padding: '2px 8px', 
                      background: 'rgba(15, 23, 42, 0.6)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '11px',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="bars">📊 Neon Vertical Bars</option>
                    <option value="radial">🌀 Radial Equalizer</option>
                    <option value="scatter">✨ Particle Scatter Plot</option>
                    <option value="chroma">🌈 Chroma Spectrogram</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  <div className="config-label-row">
                    <span>Array Size</span>
                    <strong>{size} items</strong>
                  </div>
                  <input 
                    type="range" 
                    className="config-slider"
                    min={5} 
                    max={60} 
                    value={size} 
                    onChange={e => setSize(Number(e.target.value))} 
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Column C: Custom Array Playground compile injector card */}
        <div className="controls-col">
          <h4>Custom Playground</h4>
          <div className="config-card flex-between">
            <div className="manual-input-box">
              <textarea 
                placeholder={
                  ['bfs', 'dfs', 'dijkstra', 'prim', 'preorder', 'inorder', 'postorder'].includes(algorithm)
                    ? 'Paste Graph / Tree nodes list\ne.g. A, B, C, D'
                    : 'Paste custom sequence\ne.g. 5, 20, 8, 42, 12'
                }
                value={manual} 
                onChange={e => setManual(e.target.value)}
                style={{ 
                  width: '100%',
                  height: '66px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  background: '#090a10',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '8px 10px',
                  fontFamily: 'var(--font-mono)',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>
            
            <button className="manual-btn" onClick={applyManual} style={{ width: '100%', height: '34px', fontSize: '12px' }}>
              Compile & Inject Payload
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
