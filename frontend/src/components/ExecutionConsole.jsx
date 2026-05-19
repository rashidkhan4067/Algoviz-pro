import React, { useEffect, useRef } from 'react';
import './ExecutionConsole.css';

export default function ExecutionConsole({ steps, current, array }) {
  const consoleRef = useRef();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [current, steps]);

  function getTag(type) {
    if (!type) return 'info';
    if (type === 'init') return 'init';
    if (type === 'compare') return 'compare';
    if (type === 'swap') return 'swap';
    if (type === 'overwrite') return 'swap'; // Red indicator is perfect
    if (['visit', 'discover', 'consider'].includes(type)) return 'visit';
    if (['update', 'include', 'exclude'].includes(type)) return 'update';
    if (['complete', 'done'].includes(type)) return 'complete';
    return 'visit';
  }

  function formatLogMessage(step, idx) {
    if (!step) return '';
    const arr = Array.isArray(step.array) ? step.array : array;
    const [i, j] = step.indices || [];
    
    // Safety check for arrays and elements
    const vi = (i !== undefined && arr && arr[i] !== undefined) ? arr[i] : undefined;
    const vj = (j !== undefined && arr && arr[j] !== undefined) ? arr[j] : undefined;
    
    switch (step.type) {
      case 'init':
        return `Algorithm initialized. Data elements loaded and ready.`;
      case 'compare':
        if (vi === undefined || vj === undefined) {
          if (step.meta && step.meta.exclude_value !== undefined) {
            return `Comparing: Exclude val (${step.meta.exclude_value}) vs. Include val (${step.meta.include_value})`;
          }
          return `Comparing search indices...`;
        }
        return `Comparing values: index [${i}] (${vi}) vs [${j}] (${vj})`;
      case 'swap':
        return `Swapped: position [${i}] ↔ [${j}] (${vi} and ${vj})`;
      case 'overwrite':
        return `Overwrote: slot [${i}] updated to ${vi}`;
      case 'visit':
        return `Visiting node/element: "${i}"`;
      case 'discover':
        return `Discovered: node "${i}" via link from "${step.meta?.from}"`;
      case 'update':
        if (step.meta && step.meta.new_distance !== undefined) {
          return `Updated distance: node "${i}" is now ${step.meta.new_distance}`;
        }
        return `Updated DP table cell values at index [${i}]`;
      case 'include':
        return `Item Decision: Include item at capacity bounds. Value updated.`;
      case 'exclude':
        return `Item Decision: Exclude item due to capacity weight limits.`;
      case 'complete':
        return `Execution finalized. Solution matrix built successfully.`;
      case 'done':
        return `Sorted confirmation: Elements ordered successfully. ✅`;
      default:
        return `State update executed on visual boundaries.`;
    }
  }

  // Slice logs to only show up to the current active step index
  const logsToShow = steps.slice(0, current + 1);

  return (
    <div className="terminal-wrapper">
      <div className="console-header-bar">
        <span className="console-title">
          <span className="console-dot" /> LIVE DEBUGGER CONSOLE
        </span>
        <span className="console-meta">
          Lines: {logsToShow.length} / {steps.length}
        </span>
      </div>
      <div className="terminal-console" ref={consoleRef}>
        {logsToShow.length === 0 ? (
          <div className="terminal-line">
            <span className="terminal-timestamp">[00:00:00]</span>
            <span className="terminal-tag init">SYSTEM</span>
            <span className="terminal-message">Terminal active. Run visualization to capture telemetry...</span>
          </div>
        ) : (
          logsToShow.map((step, idx) => {
            const tag = getTag(step.type);
            const msg = formatLogMessage(step, idx);
            // Simulated incrementing microsecond timestamp
            const dummySecs = String(Math.floor(idx / 3) % 60).padStart(2, '0');
            const dummyMs = String((idx * 137) % 1000).padStart(3, '0');
            const timeStr = `[08:14:${dummySecs}.${dummyMs}]`;

            return (
              <div key={idx} className={`terminal-line ${idx === current ? 'active' : ''}`}>
                <span className="terminal-timestamp">{timeStr}</span>
                <span className={`terminal-tag ${tag}`}>{tag}</span>
                <span className="terminal-message" dangerouslySetInnerHTML={{
                  __html: msg
                    .replace(/\[\d+\]/g, match => `<span class="val">${match}</span>`)
                    .replace(/\b\d+\b(?!\])/g, match => `<span class="val">${match}</span>`)
                }} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
