import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import VisualizerLayout from './components/VisualizerLayout';
import MainLayout from './components/MainLayout';
import Explore from './pages/Explore';
import Docs from './pages/Docs';
import Compare from './pages/Compare';
import Sandbox from './pages/Sandbox';

import Header from './components/Header';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([5, 3, 8, 1, 2, 7, 4]);
  const [data, setData] = useState(null);
  const [size, setSize] = useState(7);
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [visTheme, setVisTheme] = useState('bars');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
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
        setCurrent(c => {
          const next = Math.min(c + 1, steps.length - 1);
          return next;
        });
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
    if (!voiceEnabled) return;
    if (!steps || steps.length === 0) return;
    const s = steps[current];
    if (!s) return;
    const desc = describeStep(s);
    speak(desc);
  }, [current, voiceEnabled, steps]);

  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const s = steps[current];
    if (!s) return;
    const playTypes = new Set(['visit', 'discover', 'update', 'swap', 'compare', 'overwrite']);
    if (playTypes.has(s.type) && pingAudioRef.current) {
      try {
        pingAudioRef.current.currentTime = 0;
        void pingAudioRef.current.play();
      } catch (e) { /* ignore play errors */ }
    }
  }, [current, steps]);

  useEffect(() => {
    if (voiceEnabled) {
      if (steps && steps.length) speak('Voice narration enabled');
      else speak('Voice enabled');
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, [voiceEnabled]);

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    if (selectedVoice) u.voice = voices.find(v => v.name === selectedVoice) || null;
    window.speechSynthesis.speak(u);
  }

  function describeStep(step) {
    if (!step) return '';
    switch (step.type) {
      case 'compare':
        return `Comparing indices ${step.indices[0]} and ${step.indices[1]}.`;
      case 'swap':
        return `Swapped values at indices ${step.indices[0]} and ${step.indices[1]}.`;
      case 'overwrite':
        return `Wrote value at index ${step.indices[0]}.`;
      case 'visit':
        return `Visiting node ${step.indices[0]}.`;
      case 'discover':
        return `Discovering node ${step.indices[0]}.`;
      case 'update':
        return `Updating distance to node ${step.indices[0]}.`;
      case 'init':
        return `Initialization complete.`;
      case 'complete':
        return `Algorithm complete.`;
      case 'done':
        return `Sorting complete.`;
      default:
        return '';
    }
  }

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
        } else if (['bfs', 'dfs', 'dijkstra', 'prim'].includes(name)) {
          requestBody = {
            graph: { 0: { 1: 4, 2: 1 }, 1: { 3: 1 }, 2: { 1: 2, 3: 5 }, 3: {} },
            start: 0
          };
        } else if (['preorder', 'inorder', 'postorder'].includes(name)) {
          requestBody = {
            tree: { 'A': ['B', 'C'], 'B': ['D', 'E'], 'C': ['F'], 'D': [], 'E': [], 'F': [] },
            start: 'A'
          };
        } else if (name === 'fibonacci') {
          requestBody = { n: 6 };
        } else if (name === 'knapsack') {
          requestBody = {
            weights: [2, 3, 4, 5],
            values: [3, 4, 5, 6],
            capacity: 5
          };
        }
      }

      const res = await fetch(`${API_BASE}/algorithm/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const nextArray = Array.isArray(data.array)
        ? data.array
        : (Array.isArray(payloadOrArray) ? payloadOrArray : array);
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
    const customGraphStr = sessionStorage.getItem('custom_sandbox_graph');
    const customArrayStr = sessionStorage.getItem('custom_sandbox_array');

    if (customGraphStr) {
      sessionStorage.removeItem('custom_sandbox_graph');
      try {
        const payload = JSON.parse(customGraphStr);
        setPlaying(false);
        if (payload.graph) {
          setAlgorithm('dijkstra');
          loadAlgorithm(payload, 'dijkstra');
        } else if (payload.tree) {
          setAlgorithm('preorder');
          loadAlgorithm(payload, 'preorder');
        }
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if (customArrayStr) {
      sessionStorage.removeItem('custom_sandbox_array');
      try {
        const customArray = JSON.parse(customArrayStr);
        setPlaying(false);
        setArray(customArray);
        setSize(customArray.length);
        loadAlgorithm(customArray, algorithm);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    loadAlgorithm(array, algorithm);
  }, []);

  useEffect(() => {
    loadAlgorithm(array, algorithm);
  }, [algorithm]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    function updateVoices() {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      if (v.length && !selectedVoice) {
        setSelectedVoice(v[0].name);
      }
    }
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <>
      <Header />
      <main className="app">
        <Routes>
          <Route
            path="/"
            element={
              <VisualizerLayout
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                array={array}
                setArray={setArray}
                data={data}
                size={size}
                setSize={setSize}
                steps={steps}
                current={current}
                setCurrent={setCurrent}
                playing={playing}
                setPlaying={setPlaying}
                speed={speed}
                setSpeed={setSpeed}
                visTheme={visTheme}
                setVisTheme={setVisTheme}
                loadAlgorithm={loadAlgorithm}
                describeStepDetailed={describeStepDetailed}
                ALGO_INFO={ALGO_INFO}
              />
            }
          />
          <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
          <Route path="/docs" element={<MainLayout><Docs /></MainLayout>} />
          <Route path="/compare" element={<MainLayout><Compare /></MainLayout>} />
          <Route path="/sandbox" element={<MainLayout><Sandbox /></MainLayout>} />
        </Routes>
      </main>
    </>
  );
}
