import React, { useState } from 'react';
import GraphVisualization from './GraphVisualization';
import TreeVisualization from './TreeVisualization';
import SearchVisualization from './SearchVisualization';
import DpVisualization from './DpVisualization';

export default function Visualization({ algorithm, array, data, step, visTheme, stats }) {
  const isGraph = ['bfs', 'dfs', 'dijkstra', 'prim'].includes(algorithm);
  const isTree = ['preorder', 'inorder', 'postorder'].includes(algorithm);
  const isSearch = ['linear', 'binary'].includes(algorithm);
  const isDP = ['fibonacci', 'knapsack'].includes(algorithm);

  if (isGraph) {
    return <GraphVisualization graph={data} step={step} />;
  }

  if (isTree) {
    return <TreeVisualization tree={data} step={step} />;
  }

  if (isSearch) {
    return <SearchVisualization array={array} step={step} visTheme={visTheme} stats={stats} />;
  }

  if (isDP) {
    return <DpVisualization algorithm={algorithm} array={array} data={data} step={step} />;
  }

  // Sorting Visualizer Fallback (Bubble, Merge, Quick)
  const display = (step && Array.isArray(step.array)) ? step.array : array;
  
  // Performance: sample when array is large to avoid DOM/animation overload
  const MAX_BARS = 120;
  const [forceFull, setForceFull] = useState(false);
  let rendered = display;
  let sampled = false;
  
  if (!forceFull && Array.isArray(display) && display.length > MAX_BARS) {
    sampled = true;
    const n = display.length;
    rendered = [];
    for (let i = 0; i < MAX_BARS; i++) {
      const idx = Math.floor((i * n) / MAX_BARS);
      rendered.push({ value: display[idx], origIndex: idx });
    }
  } else {
    // Normalized format: object with value + origIndex
    rendered = display.map((v, i) => ({ value: v, origIndex: i }));
  }

  const max = Math.max(...display, 1);
  const active = (step && step.indices) || [];
  const type = step?.type || '';
  const pivotIndex = active && active.length === 2 ? active[1] : null;
  const meta = step?.meta || {};

  const getColClasses = (orig) => {
    const isActive = (step && step.indices) ? step.indices.includes(orig) : false;
    const cls = ['bar'];
    if (isActive) cls.push('active');
    if (type) cls.push(type);
    if (pivotIndex !== null && orig === pivotIndex) cls.push('pivot');
    if (meta && meta.sorted_tail !== undefined && orig > meta.sorted_tail) cls.push('sorted');
    if (meta && meta.range) {
      const [l, r] = meta.range;
      if (!(orig >= l && orig < r)) cls.push('dim');
    }
    return { isActive, classesString: cls.join(' '), cls };
  };

  // --- Alternative Themes Routing ---

  if (visTheme === 'radial') {
    return (
      <div className="radial-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', minHeight: '380px' }}>
        <div className="radial-wrapper" style={{ position: 'relative', width: '260px', height: '260px' }}>
          {rendered.map((item, i) => {
            const angle = (i * 360) / rendered.length;
            const v = item.value;
            const orig = item.origIndex;
            const h = Math.max(12, Math.round((v / max) * 90)); // Length up to 90px
            const { isActive, classesString } = getColClasses(orig);
            
            let barBg = 'rgba(56, 189, 248, 0.35)'; // Sky blue translucent
            if (isActive) {
              barBg = type === 'compare' ? '#fbbf24' : type === 'swap' ? '#ef4444' : '#10b981';
            } else if (classesString.includes('pivot')) {
              barBg = '#a855f7'; // Purple pivot
            } else if (classesString.includes('sorted')) {
              barBg = 'rgba(16, 185, 129, 0.7)'; // Green sorted
            } else if (classesString.includes('dim')) {
              barBg = 'rgba(255, 255, 255, 0.08)';
            }
            
            return (
              <div 
                key={orig + "-" + i} 
                className={`radial-bar-col ${isActive ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: rendered.length > 40 ? '2px' : rendered.length > 20 ? '4px' : '6px',
                  height: `${h}px`,
                  background: barBg,
                  transformOrigin: 'bottom center',
                  transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-28px)`,
                  borderRadius: '2px',
                  boxShadow: isActive ? `0 0 16px ${barBg}` : 'none',
                  transition: 'height 0.15s, background-color 0.15s, transform 0.15s'
                }}
                title={`Index ${orig + 1}: ${v}`}
              />
            );
          })}
          
          {/* Central orb with telemetry data */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(8, 10, 19, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 15px rgba(56, 189, 248, 0.2)',
            backdropFilter: 'blur(8px)',
            zIndex: 10
          }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{type || 'idle'}</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-highlight)' }}>{active.length ? active.join('↔') : '-'}</span>
          </div>
        </div>
        
        <div className="viz-annotation" style={{ marginTop: '16px' }}>
          {type ? `${type}` : ''}
          {active && active.length ? ` · Indices [${active.join(', ')}]` : ''}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Compares</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Swaps</span><strong>{stats.swaps || 0}</strong></div>
            <div><span>Writes</span><strong>{stats.overwrites || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
        
        {type === 'done' ? <div className="sorted-banner">Sorted</div> : null}
      </div>
    );
  }

  if (visTheme === 'scatter') {
    return (
      <div className="scatter-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%', minHeight: '380px' }}>
        <div className="scatter-wrapper" style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          background: 'rgba(8, 10, 19, 0.9)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          marginTop: '10px'
        }}>
          {/* Subtle grid lines overlay inside scatter canvas */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {rendered.map((item, i) => {
            const x = (i * 92) / rendered.length + 4; // safe margin left-right
            const v = item.value;
            const orig = item.origIndex;
            const y = (v / max) * 75 + 10; // safe bottom margin
            const { isActive, classesString } = getColClasses(orig);
            
            let dotColor = '#38bdf8'; // Default sky-blue
            let dotSize = '8px';
            if (isActive) {
              dotColor = type === 'compare' ? '#fbbf24' : type === 'swap' ? '#ef4444' : '#10b981';
              dotSize = '14px';
            } else if (classesString.includes('pivot')) {
              dotColor = '#a855f7';
              dotSize = '11px';
            } else if (classesString.includes('sorted')) {
              dotColor = '#10b981';
              dotSize = '9px';
            } else if (classesString.includes('dim')) {
              dotColor = 'rgba(255,255,255,0.15)';
              dotSize = '5px';
            }
            
            return (
              <div 
                key={orig + "-" + i} 
                className={`scatter-dot ${isActive ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  bottom: `${y}%`,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: dotColor,
                  transform: 'translate(-50%, 50%)',
                  boxShadow: isActive ? `0 0 16px ${dotColor}` : classesString.includes('pivot') ? `0 0 8px ${dotColor}` : 'none',
                  transition: 'left 0.2s, bottom 0.2s, background-color 0.2s, width 0.15s, height 0.15s',
                  zIndex: isActive ? 5 : 2
                }}
                title={`Index ${orig + 1}: ${v}`}
              />
            );
          })}
        </div>
        
        <div className="viz-annotation" style={{ marginTop: '16px' }}>
          {type ? `${type}` : ''}
          {active && active.length ? ` · Indices [${active.join(', ')}]` : ''}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Compares</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Swaps</span><strong>{stats.swaps || 0}</strong></div>
            <div><span>Writes</span><strong>{stats.overwrites || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
        
        {type === 'swap' && active?.length === 2 ? <div className="swap-overlay">↔</div> : null}
        {type === 'done' ? <div className="sorted-banner">Sorted</div> : null}
      </div>
    );
  }

  if (visTheme === 'chroma') {
    return (
      <div className="chroma-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%', minHeight: '380px' }}>
        <div className="chroma-wrapper" style={{
          display: 'flex',
          width: '100%',
          height: '260px',
          gap: rendered.length > 40 ? '2px' : '4px',
          alignItems: 'flex-end',
          marginTop: '10px',
          background: 'rgba(8, 10, 19, 0.6)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          {rendered.map((item, i) => {
            const v = item.value;
            const orig = item.origIndex;
            const percent = v / max;
            const h = Math.max(12, Math.round(percent * 100));
            const { isActive, classesString } = getColClasses(orig);
            
            // Build HSL hue spectrum (cool violet-blue 260deg down to vibrant hot red 0deg)
            const hue = 260 - (percent * 260);
            let color = `hsl(${hue}, 85%, 55%)`;
            let glow = `0 0 5px ${color}44`;
            
            let scaleY = isActive ? 'scaleY(1.08)' : 'scaleY(1)';

            if (isActive) {
              if (type === 'compare') {
                color = '#fbbf24'; // Neon compare yellow
                glow = '0 0 25px #fbbf24, inset 0 0 10px #ffffff';
              } else if (type === 'swap') {
                color = '#ef4444'; // Neon swap red
                glow = '0 0 25px #ef4444, inset 0 0 10px #ffffff';
              } else if (type === 'overwrite') {
                color = '#10b981'; // Neon write green
                glow = '0 0 25px #10b981, inset 0 0 10px #ffffff';
              } else {
                color = '#a855f7'; // Purple active
                glow = '0 0 25px #a855f7, inset 0 0 10px #ffffff';
              }
            } else if (classesString.includes('pivot')) {
              color = '#a855f7'; // Purple pivot
              glow = '0 0 16px #a855f7, inset 0 0 4px #fff';
            } else if (classesString.includes('sorted')) {
              color = '#10b981'; // Green sorted
              glow = '0 0 16px #10b981, inset 0 0 4px #fff';
            } else if (classesString.includes('dim')) {
              color = `hsla(${hue}, 30%, 30%, 0.15)`;
              glow = 'none';
            }
            
            if (type === 'done') {
              color = `hsl(${hue}, 85%, 55%)`;
              glow = `0 0 15px ${color}, inset 0 0 8px #ffffff`;
            }
            
            return (
              <div 
                key={orig + "-" + i} 
                className={`chroma-block ${isActive ? 'active' : ''} ${type === 'done' ? 'done' : ''}`}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: color,
                  borderRadius: '6px 6px 0 0',
                  boxShadow: glow,
                  transform: scaleY,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.15s, background-color 0.15s, height 0.2s',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8px'
                }}
                title={`Index ${orig + 1}: ${v}`}
              >
                {rendered.length < 24 && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#05060b',
                    textShadow: '0 0 4px #ffffff',
                    pointerEvents: 'none'
                  }}>
                    {v}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="viz-annotation" style={{ marginTop: '16px' }}>
          {type ? `${type}` : ''}
          {active && active.length ? ` · Indices [${active.join(', ')}]` : ''}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Compares</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Swaps</span><strong>{stats.swaps || 0}</strong></div>
            <div><span>Writes</span><strong>{stats.overwrites || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
        
        {type === 'swap' && active?.length === 2 ? <div className="swap-overlay">↔</div> : null}
        {type === 'done' ? <div className="sorted-banner">Sorted</div> : null}
      </div>
    );
  }

  // --- Classical Bars Layout (Default) ---
  return (
    <>
      <div className="bars-wrapper">
        {rendered.map((item, i) => {
          const v = item.value;
          const orig = item.origIndex;
          const h = Math.max(6, Math.round((v / max) * 100));
          const { isActive, classesString, cls } = getColClasses(orig);
          if (sampled && !forceFull) cls.push('reduced');
          
          return (
            <div key={orig + "-" + i} className="bar-col">
              <div className={cls.join(' ')} style={{ height: `${h}%` }} data-value={v} />
              {isActive && type === 'compare' ? <div className="indicator" title="compare">▾</div> : null}
              <div className={`bar-label ${isActive ? 'active' : ''}`}>{v}</div>
            </div>
          );
        })}
      </div>
      
      <div className="indices-row">
        {rendered.map((item, i) => (
          <div key={item.origIndex + "-tick"} className="tick">
            {item.origIndex + 1}
          </div>
        ))}
      </div>
      
      <div className="viz-annotation">
        {type ? `${type}` : ''}
        {active && active.length ? ` · ${active.join(',')}` : ''}
      </div>
      
      {stats ? (
        <div className="viz-stats">
          <div><span>Compares</span><strong>{stats.compares}</strong></div>
          <div><span>Swaps</span><strong>{stats.swaps}</strong></div>
          <div><span>Writes</span><strong>{stats.overwrites}</strong></div>
          <div><span>Progress</span><strong>{stats.progress}%</strong></div>
        </div>
      ) : null}
      
      {type === 'swap' && active?.length === 2 ? <div className="swap-overlay">↔</div> : null}
      {type === 'done' ? <div className="sorted-banner">Sorted</div> : null}
      
      {sampled && !forceFull ? (
        <div className="sampled-banner">
          Showing sampled view ({rendered.length} of {display.length}) —{' '}
          <button className="small" onClick={() => setForceFull(true)}>
            Render full (may be slow)
          </button>
        </div>
      ) : null}
    </>
  );
}
