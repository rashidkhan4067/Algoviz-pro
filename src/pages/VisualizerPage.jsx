import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Visualization from '../components/Visualization';
import Controls from '../components/Controls';
import CodePanel from '../components/CodePanel';
import Sidebar from '../components/Sidebar';
import PerformancePanel from '../components/PerformancePanel';
import ExecutionConsole from '../components/ExecutionConsole';

const API_BASE = 'http://localhost:5000/api';

export default function VisualizerPage() {
  const { token } = useContext(AuthContext);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([5, 3, 8, 1, 2, 7, 4]);
  const [data, setData] = useState(null);
  const [size, setSize] = useState(7);
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const pingAudioRef = useRef(null);

  const PING_URL = 'http://localhost:5000/sound/ping.mp3';

  useEffect(() => {
    try {
      pingAudioRef.current = new Audio(PING_URL);
    } catch (e) {
      pingAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    let t;
    if (playing && steps.length) {
      t = setInterval(() => {
        setCurrent(c => Math.min(c + 1, steps.length - 1));
      }, speed);
    }
    return () => clearInterval(t);
  }, [playing, steps, speed]);

  useEffect(() => {
    if (playing && steps.length && current >= steps.length - 1) {
      setPlaying(false);
    }
  }, [current, steps, playing]);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const s = steps[current];
    if (!s) return;
    const playTypes = new Set(['visit', 'discover', 'update', 'swap', 'compare', 'overwrite']);
    
    const soundEnabled = localStorage.getItem('algoview_sound_enabled') !== 'false';
    if (soundEnabled && playTypes.has(s.type) && pingAudioRef.current) {
      try {
        pingAudioRef.current.currentTime = 0;
        void pingAudioRef.current.play();
      } catch (e) { /* ignore play errors */ }
    }
  }, [current, steps]);

  function describeStepDetailed(step) {
    if (!step) return '';
    const arr = Array.isArray(step.array) ? step.array : array;
    const [i, j] = step.indices || [];
    const vi = (i !== undefined && arr[i] !== undefined) ? arr[i] : undefined;
    const vj = (j !== undefined && arr[j] !== undefined) ? arr[j] : undefined;
    switch (step.type) {
      case 'compare':
        if (vi === undefined || vj === undefined) return `Compare positions ${i} and ${j}.`;
        const cmp = vi > vj ? 'left > right → swap' : 'left ≤ right → keep order';
        return `Compare positions ${i} and ${j}: ${vi} vs ${vj} (${cmp}).`;
      case 'swap':
        return `Swap positions ${i} and ${j}: ${vi} ↔ ${vj}. Places the smaller on the left.`;
      case 'overwrite':
        return `Write value at position ${i}: becomes ${vi}. Merging sorted halves.`;
      case 'visit':
        return `Visiting node ${i}.`;
      case 'discover':
        return `Discovering new node ${i} from ${step.meta?.from}.`;
      case 'update':
        return `Updating distance for node ${i}. New distance is ${step.meta?.new_distance}.`;
      case 'init':
        return `Algorithm initialized.`;
      case 'complete':
        return `Algorithm has completed its execution.`;
      case 'done':
        return `All elements are ordered from smallest to largest. ✅`;
      default:
        return '';
    }
  }

  const ALGO_INFO = {
    bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', stable: 'Yes', in_place: 'Yes', idea: 'Repeatedly compare adjacent elements and swap if out of order.' },
    merge: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', stable: 'Yes', in_place: 'No', idea: 'Divide array, sort halves, merge two sorted lists.' },
    quick: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', stable: 'No', in_place: 'Yes', idea: 'Partition around a pivot, recurse on subarrays.' },
    linear: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', stable: 'N/A', in_place: 'Yes', idea: 'Check each element sequentially until target is found.' },
    binary: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)', stable: 'N/A', in_place: 'Yes', idea: 'Divide search space in half repeatedly on sorted array.' },
    bfs: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', stable: 'N/A', in_place: 'Yes', idea: 'Explore neighbors level by level using queue.' },
    dfs: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', stable: 'N/A', in_place: 'Yes', idea: 'Explore as far as possible along each branch using stack.' },
    dijkstra: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)', stable: 'N/A', in_place: 'No', idea: 'Find shortest paths from source to all nodes using priority queue.' },
    prim: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)', stable: 'N/A', in_place: 'No', idea: 'Find minimum spanning tree by adding best edge from visited.' },
    preorder: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', stable: 'N/A', in_place: 'No', idea: 'Visit root, then left subtree, then right subtree.' },
    inorder: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', stable: 'N/A', in_place: 'No', idea: 'Visit left subtree, then root, then right subtree.' },
    postorder: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', stable: 'N/A', in_place: 'No', idea: 'Visit left subtree, then right subtree, then root.' },
    fibonacci: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', stable: 'N/A', in_place: 'Yes', idea: 'Build Fibonacci sequence using dynamic programming.' },
    knapsack: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)', stable: 'N/A', in_place: 'Yes', idea: 'Maximize value without exceeding weight capacity.' }
  };

  async function loadAlgorithm(payloadOrArray = array, name = algorithm) {
    try {
      let requestBody = {};
      if (
        payloadOrArray &&
        typeof payloadOrArray === 'object' &&
        !Array.isArray(payloadOrArray)
      ) {
        requestBody = payloadOrArray;
      } else {
        if (['bubble', 'merge', 'quick', 'linear', 'binary'].includes(name)) {
          requestBody = { array: payloadOrArray };
          if (name === 'linear' || name === 'binary') {
            requestBody.target = Array.isArray(payloadOrArray) ? Math.max(...payloadOrArray) : 42;
          }
        } else {
          // Other algorithm types will let Flask fall back to default assets
          requestBody = {};
        }
      }

      const res = await fetch(`${API_BASE}/algorithm/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const nextArray = Array.isArray(data.array) ? data.array : arr;
      const nextSteps = Array.isArray(data.steps) ? data.steps : [];

      setArray(nextArray);
      setSteps(nextSteps);
      setData(data.graph || data.tree || null);
      setCurrent(0);
      setPlaying(false);
    } catch (err) {
      console.error('Failed to load algorithm steps', err);
      setCurrent(0);
      setPlaying(false);
      setSteps([]);
    }
  }

  useEffect(() => {
    if (token) {
      loadAlgorithm(array, algorithm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, token]);

  const stats = React.useMemo(() => {
    const s = steps.slice(0, Math.min(current + 1, steps.length));
    let compares = 0, swaps = 0, overwrites = 0;
    for (const st of s) {
      if (st.type === 'compare') compares++;
      else if (st.type === 'swap') swaps++;
      else if (st.type === 'overwrite') overwrites++;
    }
    const progress = steps.length ? Math.round(((current + 1) / steps.length) * 100) : 0;
    return { compares, swaps, overwrites, progress };
  }, [steps, current]);

  return (
    <>
      <aside className="sidebar"><Sidebar algorithm={algorithm} setAlgorithm={setAlgorithm} /></aside>
      <section className="content-card">
        <div className="breadcrumbs">
          Algorithms › {['bubble', 'merge', 'quick'].includes(algorithm) ? 'Sorting' : '...'} › {algorithm}
        </div>
        <div className="viz">
          <Visualization algorithm={algorithm} array={array} data={data} step={steps[current]} stats={stats} />
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
          />
        </div>
      </section>
      <aside className="right-panel">
        <div className="card" style={{ padding: '14px 18px 18px 18px' }}>
          <ExecutionConsole steps={steps} current={current} array={array} />
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
            <div><span>Best</span><strong>{ALGO_INFO[algorithm]?.best}</strong></div>
            <div><span>Average</span><strong>{ALGO_INFO[algorithm]?.average}</strong></div>
            <div><span>Worst</span><strong>{ALGO_INFO[algorithm]?.worst}</strong></div>
            <div><span>Stable</span><strong>{ALGO_INFO[algorithm]?.stable}</strong></div>
            <div><span>In-place</span><strong>{ALGO_INFO[algorithm]?.in_place}</strong></div>
            <div className="idea"><span>Idea</span><strong>{ALGO_INFO[algorithm]?.idea}</strong></div>
          </div>
        </div>
        <div className="card codepanel">
          <CodePanel algorithm={algorithm} highlightLine={steps[current]?.line} />
        </div>
      </aside>
    </>
  );
}
