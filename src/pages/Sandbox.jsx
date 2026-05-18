import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sandbox.css';

const GRAPH_TEMPLATES = {
  ring: {
    graph: {
      "0": {"1": 2, "5": 5},
      "1": {"0": 2, "2": 3},
      "2": {"1": 3, "3": 1},
      "3": {"2": 1, "4": 4},
      "4": {"3": 4, "5": 2},
      "5": {"4": 2, "0": 5}
    },
    start: "0"
  },
  mesh: {
    graph: {
      "A": {"B": 4, "C": 2, "D": 8},
      "B": {"A": 4, "C": 1, "E": 5},
      "C": {"A": 2, "B": 1, "D": 3, "E": 6},
      "D": {"A": 8, "C": 3, "E": 2},
      "E": {"B": 5, "C": 6, "D": 2}
    },
    start: "A"
  },
  binaryTree: {
    tree: {
      "Root": ["LeftChild", "RightChild"],
      "LeftChild": ["Sub1", "Sub2"],
      "RightChild": ["Sub3"],
      "Sub1": [],
      "Sub2": [],
      "Sub3": []
    },
    start: "Root"
  }
};

export default function Sandbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'array' | 'aesthetics'
  
  // Custom Graph Designer state
  const [graphJson, setGraphJson] = useState(JSON.stringify(GRAPH_TEMPLATES.mesh, null, 2));
  const [graphError, setGraphError] = useState(null);
  const [isValidGraph, setIsValidGraph] = useState(true);

  // Custom Array Generator state
  const [arraySize, setArraySize] = useState(10);
  const [generatedArray, setGeneratedArray] = useState([23, 45, 12, 67, 34, 89, 56, 78, 9, 90]);
  const [arrayType, setArrayType] = useState('random'); // 'random' | 'almost' | 'reversed'

  // Visual Aesthetic Tuning state (Loads or saves to localStorage so App.jsx can read it!)
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('sandbox_glow')) || 8);
  const [nodeSize, setNodeSize] = useState(() => Number(localStorage.getItem('sandbox_node_size')) || 22);
  const [primaryNeon, setPrimaryNeon] = useState(() => localStorage.getItem('sandbox_primary_neon') || '#06b6d4');

  // JSON Validation Loop
  useEffect(() => {
    if (activeTab !== 'graph') return;
    try {
      const parsed = JSON.parse(graphJson);
      if (!parsed.graph && !parsed.tree) {
        setGraphError('Error: Root payload must contain either "graph" or "tree" object.');
        setIsValidGraph(false);
        return;
      }
      if (parsed.start === undefined) {
        setGraphError('Error: A starting node "start" key must be declared.');
        setIsValidGraph(false);
        return;
      }
      setGraphError(null);
      setIsValidGraph(true);
    } catch (err) {
      setGraphError(`JSON Parse Syntax Error: ${err.message}`);
      setIsValidGraph(false);
    }
  }, [graphJson, activeTab]);

  const loadGraphTemplate = (name) => {
    setGraphJson(JSON.stringify(GRAPH_TEMPLATES[name], null, 2));
  };

  const handleGenerateArray = () => {
    const size = Math.max(3, Math.min(arraySize, 30));
    let arr = [];
    if (arrayType === 'random') {
      arr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
    } else if (arrayType === 'reversed') {
      arr = Array.from({ length: size }, (_, i) => Math.floor((size - i) * (100 / size)));
    } else { // almost sorted
      arr = Array.from({ length: size }, (_, i) => Math.floor((i + 1) * (90 / size) + 10));
      if (arr.length > 3) {
        // Swap 2 random elements to make it "almost" sorted
        const idx1 = Math.floor(Math.random() * (size - 1));
        const idx2 = idx1 + 1;
        const temp = arr[idx1];
        arr[idx1] = arr[idx2];
        arr[idx2] = temp;
      }
    }
    setGeneratedArray(arr);
  };

  // Aesthetic Save settings
  const handleSaveAesthetics = () => {
    localStorage.setItem('sandbox_glow', String(glowIntensity));
    localStorage.setItem('sandbox_node_size', String(nodeSize));
    localStorage.setItem('sandbox_primary_neon', primaryNeon);
    
    // Injects raw CSS custom properties directly onto document body for live theme modifications!
    document.documentElement.style.setProperty('--neon-glow-radius', `${glowIntensity}px`);
    document.documentElement.style.setProperty('--node-radius', `${nodeSize}px`);
    document.documentElement.style.setProperty('--neon-cyan', primaryNeon);
    
    alert('Aesthetic parameters saved successfully! They will update immediately on the active canvas.');
  };

  const handleApplyToVisualizer = () => {
    if (activeTab === 'graph') {
      if (!isValidGraph) {
        alert('Cannot load graph: Please resolve formatting JSON syntax errors first.');
        return;
      }
      const parsed = JSON.parse(graphJson);
      // Cache customized graph configuration in sessionStorage so VisualizerPage/App can load it
      sessionStorage.setItem('custom_sandbox_graph', JSON.stringify(parsed));
      
      alert('Custom Sandbox Graph applied! Redirecting to visualizer...');
      navigate('/', { state: { loadCustomSandbox: true } });
    } else if (activeTab === 'array') {
      sessionStorage.setItem('custom_sandbox_array', JSON.stringify(generatedArray));
      alert('Custom Sandbox Array applied! Redirecting to visualizer...');
      navigate('/', { state: { loadCustomSandbox: true } });
    }
  };

  return (
    <div className="sandbox-page">
      <div className="sandbox-header">
        <h2 className="title-glow">Interactive Sandbox Studio</h2>
        <p className="subtitle">Tune visualization styling details, formulate custom complex node topologies, or forge specific arrays to test boundaries.</p>
      </div>

      {/* Mode selectors */}
      <div className="sandbox-tabs">
        <button 
          className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          Graph & Tree Topology Designer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'array' ? 'active' : ''}`}
          onClick={() => setActiveTab('array')}
        >
          Dynamic Array Generator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'aesthetics' ? 'active' : ''}`}
          onClick={() => setActiveTab('aesthetics')}
        >
          Visual Aesthetic Tuner
        </button>
      </div>

      {/* Editor Main Content Area */}
      <div className="sandbox-content-container">
        {/* TAB 1: GRAPH & TREE Topologies */}
        {activeTab === 'graph' && (
          <div className="tab-pane">
            <div className="designer-column layout-split">
              <div className="editor-side">
                <div className="editor-toolbar">
                  <span className="toolbar-title">JSON Configuration Code</span>
                  <div className="template-btn-group">
                    <button onClick={() => loadGraphTemplate('ring')} className="mini-btn">Ring Topology</button>
                    <button onClick={() => loadGraphTemplate('mesh')} className="mini-btn">Mesh Network</button>
                    <button onClick={() => loadGraphTemplate('binaryTree')} className="mini-btn">Binary Search tree</button>
                  </div>
                </div>

                <textarea 
                  className="code-editor"
                  value={graphJson} 
                  onChange={e => setGraphJson(e.target.value)}
                  spellCheck="false"
                />

                <div className="validation-footer">
                  {isValidGraph ? (
                    <div className="status-success font-mono">
                      <span className="dot dot-green"></span>
                      Structure Validated: Ready to load.
                    </div>
                  ) : (
                    <div className="status-error font-mono">
                      <span className="dot dot-red"></span>
                      {graphError}
                    </div>
                  )}
                </div>
              </div>

              <div className="controls-side flex-column">
                <h3>Custom Nodes Playground</h3>
                <p className="desc-paragraph">Format your adjacency mappings. Trees specify lists of children, while graphs specify target neighbors with weight values.</p>
                
                <div className="tips-panel">
                  <h4>Formatting Rules:</h4>
                  <ul>
                    <li>Use strict JSON: keys must be double-quoted strings (e.g. <code>"0"</code>, <code>"A"</code>).</li>
                    <li>Weights should be integers or floats.</li>
                    <li>Declare the start point explicitly: <code>"start": "A"</code>.</li>
                  </ul>
                </div>

                <button 
                  className="primary-btn glow-cyan apply-btn"
                  onClick={handleApplyToVisualizer}
                  disabled={!isValidGraph}
                >
                  Apply & Visualize Custom Structure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Array Generator */}
        {activeTab === 'array' && (
          <div className="tab-pane">
            <div className="designer-column layout-split">
              <div className="editor-side">
                <div className="editor-toolbar">
                  <span className="toolbar-title">Generated Test Array</span>
                </div>

                <div className="array-preview-box">
                  <div className="array-preview-trail">
                    {generatedArray.map((val, idx) => (
                      <div key={idx} className="preview-element-card">
                        <span className="preview-val">{val}</span>
                        <span className="preview-idx">[{idx}]</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="raw-preview">
                  <span className="font-mono">Payload: [{generatedArray.join(', ')}]</span>
                </div>
              </div>

              <div className="controls-side flex-column">
                <h3>Configure Array Parameters</h3>
                
                <div className="sandbox-config-item">
                  <label>Array Size (Total elements)</label>
                  <input 
                    type="number" 
                    min="3" 
                    max="30"
                    className="arena-input"
                    value={arraySize}
                    onChange={e => setArraySize(Number(e.target.value))}
                  />
                </div>

                <div className="sandbox-config-item">
                  <label>Initial Sorting State</label>
                  <select 
                    className="arena-select"
                    value={arrayType}
                    onChange={e => setArrayType(e.target.value)}
                  >
                    <option value="random">Randomized values</option>
                    <option value="reversed">Strictly Decreasing (Worst Case)</option>
                    <option value="almost">Nearly Sorted (Partial Order)</option>
                  </select>
                </div>

                <button 
                  className="secondary-btn glow-green" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleGenerateArray}
                >
                  Generate Dataset
                </button>

                <button 
                  className="primary-btn glow-cyan apply-btn" 
                  style={{ marginTop: 'auto' }}
                  onClick={handleApplyToVisualizer}
                >
                  Apply to Main Visualizer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Visual Aesthetic Tuner */}
        {activeTab === 'aesthetics' && (
          <div className="tab-pane">
            <div className="designer-column layout-split">
              <div className="editor-side flex-column" style={{ gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
                <div className="preview-orb-container">
                  <div 
                    className="preview-telemetry-orb"
                    style={{ 
                      width: `${nodeSize * 2.2}px`, 
                      height: `${nodeSize * 2.2}px`,
                      boxShadow: `0 0 ${glowIntensity * 2}px ${primaryNeon}`,
                      borderColor: primaryNeon
                    }}
                  >
                    <span className="orb-glow-label">Glow: {glowIntensity}px</span>
                  </div>
                </div>
                <span className="preview-caption font-mono">Live Interactive Node Styling Preview</span>
              </div>

              <div className="controls-side flex-column">
                <h3>Visual Aesthetic Configurations</h3>
                <p className="desc-paragraph">Tweak local design system properties in real time to suit your screen, style, or focus limits.</p>

                <div className="tuner-input-group">
                  <div className="slider-header-row">
                    <span className="slider-label">Neon Glow Aura</span>
                    <span className="slider-val">{glowIntensity}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={glowIntensity} 
                    onChange={e => setGlowIntensity(Number(e.target.value))}
                  />
                </div>

                <div className="tuner-input-group">
                  <div className="slider-header-row">
                    <span className="slider-label">Canvas Node Size (Radius)</span>
                    <span className="slider-val">{nodeSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="35" 
                    value={nodeSize} 
                    onChange={e => setNodeSize(Number(e.target.value))}
                  />
                </div>

                <div className="tuner-input-group">
                  <label className="slider-label" style={{ marginBottom: '6px' }}>Neon Signature Color Accent</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      className="color-wheel-picker"
                      value={primaryNeon} 
                      onChange={e => setPrimaryNeon(e.target.value)}
                    />
                    <span className="font-mono text-uppercase">{primaryNeon}</span>
                  </div>
                </div>

                <button 
                  className="primary-btn glow-cyan apply-btn" 
                  style={{ marginTop: 'auto' }}
                  onClick={handleSaveAesthetics}
                >
                  Save & Apply Aesthetic Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
