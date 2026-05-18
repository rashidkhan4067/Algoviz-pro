import React from 'react';
import './SearchVisualization.css';

export default function SearchVisualization({ array, step, visTheme, stats }) {
  const display = (step && Array.isArray(step.array)) ? step.array : array;
  const max = Math.max(...display, 1);
  const active = (step && step.indices) || [];
  const type = step?.type || '';
  const meta = step?.meta || {};
  const target = meta?.target || null;

  const getSearchColClasses = (i) => {
    const isActive = active.includes(i);
    const isFound = type === 'found' && isActive;
    const cls = ['bar'];
    if (isActive) cls.push('active');
    if (isFound) cls.push('found');
    if (type) cls.push(type);
    return { isActive, isFound, classesString: cls.join(' '), cls };
  };

  // --- Alternative Themes Routing ---

  if (visTheme === 'radial') {
    return (
      <div className="radial-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', minHeight: '380px' }}>
        {target !== null && (
          <div className="target-display" style={{ marginBottom: '14px' }}>
            <span className="target-label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target:</span>
            <span className="target-value" style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginLeft: '6px' }}>{target}</span>
          </div>
        )}

        <div className="radial-wrapper" style={{ position: 'relative', width: '250px', height: '250px' }}>
          {display.map((v, i) => {
            const angle = (i * 360) / display.length;
            const h = Math.max(12, Math.round((v / max) * 85)); // Length up to 85px
            const { isActive, isFound, classesString } = getSearchColClasses(i);
            
            let barBg = 'rgba(56, 189, 248, 0.35)'; // Sky blue translucent
            if (isFound) {
              barBg = '#10b981'; // Found green!
            } else if (isActive) {
              barBg = '#fbbf24'; // Active comparing yellow
            } else if (classesString.includes('dim') || (type === 'found' && !isFound)) {
              barBg = 'rgba(255, 255, 255, 0.08)';
            }
            
            return (
              <div 
                key={i} 
                className={`radial-bar-col ${isActive ? 'active' : ''} ${isFound ? 'found' : ''}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: display.length > 30 ? '3px' : '6px',
                  height: `${h}px`,
                  background: barBg,
                  transformOrigin: 'bottom center',
                  transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-24px)`,
                  borderRadius: '2px',
                  boxShadow: isFound ? '0 0 20px #10b981' : isActive ? '0 0 14px #fbbf24' : 'none',
                  transition: 'height 0.15s, background-color 0.15s, transform 0.15s'
                }}
                title={`Index ${i}: ${v}`}
              />
            );
          })}
          
          {/* Central glass telemetry orb */}
          <div className={`radial-center-orb ${active.length > 0 ? 'active' : ''} ${type === 'found' ? 'found' : ''}`} style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            zIndex: 10
          }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {type === 'found' ? 'FOUND' : active.length > 0 ? 'COMPARING' : 'IDLE'}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: type === 'found' ? '#10b981' : active.length > 0 ? '#fbbf24' : 'var(--text-highlight)' }}>
              {active.length ? display[active[0]] : '-'}
            </span>
          </div>
        </div>

        <div className="search-status" style={{ marginTop: '14px' }}>
          {type === 'found' && active.length > 0 && (
            <div className="found-banner">Found target at Index {active[0]}!</div>
          )}
          {type === 'not_found' && (
            <div className="not-found-banner">Target not found. Search completed.</div>
          )}
          {type === 'compare' && active.length > 0 && (
            <div className="compare-info">
              Comparing array[{active[0]}] = {display[active[0]]}
            </div>
          )}
        </div>
        
        <div className="viz-annotation" style={{ marginTop: '8px' }}>
          {type ? `${type}` : ''}
          {active && active.length ? ` · index ${active.join(',')}` : ''}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Comparisons</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
      </div>
    );
  }

  if (visTheme === 'scatter') {
    return (
      <div className="scatter-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%', minHeight: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {target !== null && (
            <div className="target-display">
              <span className="target-label">Target:</span>
              <span className="target-value">{target}</span>
            </div>
          )}
        </div>

        <div className="scatter-wrapper" style={{
          position: 'relative',
          width: '100%',
          height: '260px',
          background: 'rgba(8, 10, 19, 0.9)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          marginTop: '10px'
        }}>
          {/* Subtle grid lines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {display.map((v, i) => {
            const x = (i * 92) / display.length + 4; // safe margin left-right
            const y = (v / max) * 75 + 10; // safe bottom margin
            const { isActive, isFound } = getSearchColClasses(i);
            
            let dotColor = '#38bdf8'; // Default sky-blue
            let dotSize = '8px';
            if (isFound) {
              dotColor = '#10b981';
              dotSize = '14px';
            } else if (isActive) {
              dotColor = '#fbbf24';
              dotSize = '14px';
            }
            
            return (
              <div 
                key={i} 
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
                  boxShadow: isActive || isFound ? `0 0 16px ${dotColor}` : 'none',
                  transition: 'all 0.2s',
                  zIndex: isActive || isFound ? 5 : 2
                }}
                title={`Index ${i}: ${v}`}
              />
            );
          })}
        </div>

        <div className="search-status" style={{ marginTop: '12px' }}>
          {type === 'found' && active.length > 0 && (
            <div className="found-banner">Found target at Index {active[0]}!</div>
          )}
          {type === 'not_found' && (
            <div className="not-found-banner">Target not found. Search completed.</div>
          )}
          {type === 'compare' && active.length > 0 && (
            <div className="compare-info">
              Comparing array[{active[0]}] = {display[active[0]]}
            </div>
          )}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Comparisons</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
      </div>
    );
  }

  if (visTheme === 'chroma') {
    return (
      <div className="chroma-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%', minHeight: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {target !== null && (
            <div className="target-display">
              <span className="target-label">Target:</span>
              <span className="target-value">{target}</span>
            </div>
          )}
        </div>

        <div className="chroma-wrapper" style={{
          display: 'flex',
          width: '100%',
          height: '240px',
          gap: display.length > 40 ? '2px' : '4px',
          alignItems: 'flex-end',
          marginTop: '10px',
          background: 'rgba(8, 10, 19, 0.6)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          {display.map((v, i) => {
            const percent = v / max;
            const h = Math.max(12, Math.round(percent * 100));
            const { isActive, isFound } = getSearchColClasses(i);
            
            // Cool violet blue to vibrant hot red spectrum
            const hue = 260 - (percent * 260);
            let color = `hsl(${hue}, 85%, 55%)`;
            let glow = `0 0 5px ${color}44`;
            
            let scaleY = isActive || isFound ? 'scaleY(1.08)' : 'scaleY(1)';

            if (isFound) {
              color = '#10b981'; // Found neon green
              glow = '0 0 25px #10b981, inset 0 0 12px #ffffff';
            } else if (isActive) {
              color = '#fbbf24'; // Comparing neon yellow
              glow = '0 0 25px #fbbf24, inset 0 0 10px #ffffff';
            } else if (type === 'found' && !isFound) {
              color = `hsla(${hue}, 30%, 30%, 0.15)`;
              glow = 'none';
            } else if (type === 'found') {
              glow = `0 0 15px ${color}, inset 0 0 8px #ffffff`;
            }
            
            return (
              <div 
                key={i} 
                className={`chroma-block ${isActive ? 'active' : ''} ${isFound ? 'found' : ''} ${type === 'found' ? 'done' : ''}`}
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
                title={`Index ${i}: ${v}`}
              >
                {display.length < 24 && (
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

        <div className="search-status" style={{ marginTop: '12px' }}>
          {type === 'found' && active.length > 0 && (
            <div className="found-banner">Found target at Index {active[0]}!</div>
          )}
          {type === 'not_found' && (
            <div className="not-found-banner">Target not found. Search completed.</div>
          )}
          {type === 'compare' && active.length > 0 && (
            <div className="compare-info">
              Comparing array[{active[0]}] = {display[active[0]]}
            </div>
          )}
        </div>
        
        {stats ? (
          <div className="viz-stats" style={{ width: '100%', marginTop: '12px' }}>
            <div><span>Comparisons</span><strong>{stats.compares || 0}</strong></div>
            <div><span>Progress</span><strong>{stats.progress || 0}%</strong></div>
          </div>
        ) : null}
      </div>
    );
  }

  // --- Classical Bars Layout (Default) ---
  return (
    <div className="search-viz-wrapper">
      {target !== null && (
        <div className="target-display">
          <span className="target-label">Target:</span>
          <span className="target-value">{target}</span>
        </div>
      )}
      
      <div className="bars-wrapper">
        {display.map((v, i) => {
          const h = Math.max(6, Math.round((v / max) * 100));
          const { isActive, isFound, cls } = getSearchColClasses(i);
          
          return (
            <div key={i} className="bar-col">
              <div className={cls.join(' ')} style={{ height: `${h}%` }} data-value={v} />
              {isActive && type === 'compare' ? <div className="indicator" title="comparing">▾</div> : null}
              {isFound ? <div className="found-indicator" title="found!">✓</div> : null}
              <div className={`bar-label ${isActive ? 'active' : ''} ${isFound ? 'found' : ''}`}>{v}</div>
            </div>
          );
        })}
      </div>
      
      <div className="indices-row">
        {display.map((_, i) => <div key={i} className="tick">{i}</div>)}
      </div>
      
      <div className="search-status">
        {type === 'found' && active.length > 0 && (
          <div className="found-banner">Found target at Index {active[0]}!</div>
        )}
        {type === 'not_found' && (
          <div className="not-found-banner">Target not found in array. Search completed.</div>
        )}
        {type === 'compare' && active.length > 0 && (
          <div className="compare-info">
            Comparing array[{active[0]}] = {display[active[0]]} with target = {target}
          </div>
        )}
      </div>
      
      <div className="viz-annotation">
        {type ? `${type}` : ''}
        {active && active.length ? ` · index ${active.join(',')}` : ''}
        {meta.comparisons ? ` · comparisons: ${meta.comparisons}` : ''}
      </div>
      
      {stats ? (
        <div className="viz-stats">
          <div><span>Comparisons</span><strong>{stats.compares}</strong></div>
          <div><span>Progress</span><strong>{stats.progress}%</strong></div>
        </div>
      ) : null}
    </div>
  );
}