import React from 'react';
import './DpVisualization.css';

export default function DpVisualization({ algorithm, array, data, step }) {
  if (algorithm === 'fibonacci') {
    const dpTableRaw = (step && Array.isArray(step.array)) ? step.array : (Array.isArray(array) ? array : []);
    const is1D = Array.isArray(dpTableRaw) && (dpTableRaw.length === 0 || !Array.isArray(dpTableRaw[0]));
    const dpTable = is1D ? dpTableRaw : [];
    const n = dpTable.length > 0 ? dpTable.length - 1 : 0;
    
    // Highlight indexes based on active step indices and metadata
    let activeIndex = null;
    let sourceIndices = [];
    let isComplete = false;
    let explanation = '';
    let equation = null;

    if (step) {
      const { type, indices, meta } = step;
      if (type === 'init') {
        explanation = 'Initialize Fibonacci DP table with zeroes.';
      } else if (type === 'base_case') {
        activeIndex = indices[0];
        explanation = `Set base case: dp[${activeIndex}] = ${meta.value}`;
        equation = `dp[${activeIndex}] = ${meta.value}`;
      } else if (type === 'calculate') {
        activeIndex = indices[0];
        sourceIndices = [activeIndex - 1, activeIndex - 2];
        explanation = `Calculating dp[${activeIndex}]: Read the previous two values.`;
        equation = `dp[${activeIndex}] = dp[${activeIndex - 1}] + dp[${activeIndex - 2}]`;
      } else if (type === 'update') {
        activeIndex = indices[0];
        sourceIndices = meta.from_indices || [activeIndex - 1, activeIndex - 2];
        explanation = `Update dp[${activeIndex}] by summing dp[${activeIndex - 1}] (${dpTable[activeIndex - 1]}) and dp[${activeIndex - 2}] (${dpTable[activeIndex - 2]}).`;
        equation = `dp[${activeIndex}] = ${dpTable[activeIndex - 1]} + ${dpTable[activeIndex - 2]} = ${meta.result}`;
      } else if (type === 'complete') {
        isComplete = true;
        explanation = `Fibonacci calculation complete! F(${n}) = ${meta.final_result}.`;
        equation = `F(${n}) = ${meta.final_result}`;
      }
    }

    return (
      <div className="dp-container">
        <div className="fib-array">
          {dpTable.map((val, i) => {
            const isActive = i === activeIndex;
            const isSource = sourceIndices.includes(i);
            const cls = ['fib-cell'];
            if (isActive) cls.push('state-active');
            if (isSource) cls.push('state-source');
            if (isComplete) cls.push('state-complete');
            
            return (
              <div key={i} className={cls.join(' ')}>
                <div className="cell-index">dp[{i}]</div>
                <div className="cell-value">{val}</div>
              </div>
            );
          })}
        </div>

        <div className="dp-summary-dock">
          <h4>Execution Insights</h4>
          <p className="dp-desc">{explanation}</p>
          {equation && (
            <div className="dp-equation" dangerouslySetInnerHTML={{
              __html: equation
                .replace(/dp\[\d+\]/g, match => `<span class="act">${match}</span>`)
                .replace(/\b\d+\b(?!\])/g, match => `<span class="res">${match}</span>`)
            }} />
          )}
        </div>
      </div>
    );
  }

  if (algorithm === 'knapsack') {
    // Load Knapsack data parameters safely
    const weights = data?.weights || [2, 3, 4, 5];
    const values = data?.values || [3, 4, 5, 6];
    const capacity = data?.capacity || 5;
    const n = weights.length;

    // dpTable is a 2D list: (N + 1) rows, (capacity + 1) columns
    const dpTableRaw = (step && Array.isArray(step.array)) ? step.array : null;
    const is2D = Array.isArray(dpTableRaw) && dpTableRaw.length > 0 && Array.isArray(dpTableRaw[0]);
    const dpTable = is2D 
      ? dpTableRaw 
      : Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    let activeRow = null;
    let activeCol = null;
    let compareSources = [];
    let backtrackCells = [];
    let explanation = '';
    let decision = '';
    let isComplete = false;

    if (step) {
      const { type, indices, meta } = step;
      if (type === 'init') {
        explanation = 'Initialize Knapsack Dynamic Programming grid table with base cases (0 items or 0 capacity = value of 0).';
      } else if (type === 'consider') {
        activeRow = indices[0];
        activeCol = indices[1];
        explanation = `Evaluating Item ${activeRow} (Weight: ${meta.weight}, Value: ${meta.value}) at capacity ${activeCol}.`;
        if (meta.weight > activeCol) {
          decision = `Weight (${meta.weight}) exceeds capacity (${activeCol}). Exclude item.`;
        } else {
          decision = `Weight (${meta.weight}) fits in capacity. Compare including vs. excluding.`;
        }
      } else if (type === 'compare') {
        activeRow = indices[0];
        activeCol = indices[1];
        const itemWt = weights[activeRow - 1];
        compareSources = [
          { r: activeRow - 1, c: activeCol }, // Exclude cell
          { r: activeRow - 1, c: activeCol - itemWt } // Include cell
        ];
        explanation = `Comparing outcomes for capacity ${activeCol}:`;
        decision = `Exclude: value from above = ${meta.exclude_value}. Include: item value (${values[activeRow - 1]}) + remaining value (${dpTable[activeRow - 1][activeCol - itemWt]}) = ${meta.include_value}.`;
      } else if (type === 'include') {
        activeRow = indices[0];
        activeCol = indices[1];
        explanation = `Decision: Include Item ${activeRow}! It yields higher value.`;
        decision = `Set dp[${activeRow}][${activeCol}] = ${meta.value}`;
      } else if (type === 'exclude') {
        activeRow = indices[0];
        activeCol = indices[1];
        explanation = `Decision: Exclude Item ${activeRow} (due to capacity constraints or lesser value).`;
        decision = `Set dp[${activeRow}][${activeCol}] = value from cell directly above = ${dpTable[activeRow - 1][activeCol]}`;
      } else if (type === 'complete') {
        isComplete = true;
        explanation = `Knapsack optimal value = ${meta.max_value}.`;
        
        // Dynamic optimal backtrack path calculations
        if (meta.selected_items) {
          let curW = capacity;
          for (let curI = n; curI > 0; curI--) {
            backtrackCells.push(`${curI}-${curW}`);
            if (meta.selected_items.includes(curI - 1)) {
              curW -= weights[curI - 1];
            }
          }
          backtrackCells.push(`0-${curW}`);
        }
      }
    }

    return (
      <div className="dp-container">
        <div className="dp-table-wrapper">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Item / Capacity</th>
                {Array.from({ length: capacity + 1 }).map((_, w) => (
                  <th key={w}>Cap {w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, i) => {
                const itemLabel = i === 0 
                  ? 'Base (No Items)' 
                  : `Item ${i} (W:${weights[i - 1]}, V:${values[i - 1]})`;
                
                return (
                  <tr key={i}>
                    <td className="row-label">{itemLabel}</td>
                    {row.map((val, w) => {
                      const isActive = i === activeRow && w === activeCol;
                      const isCompare = compareSources.some(s => s.r === i && s.c === w);
                      const isSelectedPath = backtrackCells.includes(`${i}-${w}`);
                      
                      const cls = [];
                      if (isActive) cls.push('state-active');
                      if (isCompare) cls.push('state-compare');
                      if (isSelectedPath) cls.push('state-select');
                      if (val > 0) cls.push('state-filled');
                      
                      let tooltip = `dp[row ${i}][col ${w}] = ${val}`;
                      if (i > 0) {
                        tooltip += `\nItem: weight ${weights[i - 1]}, value ${values[i - 1]}`;
                      }

                      return (
                        <td key={w} className={cls.join(' ')} title={tooltip}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="dp-summary-dock">
          <h4>DP Execution Matrix</h4>
          <p className="dp-desc"><strong>Step Info:</strong> {explanation}</p>
          {decision && <p className="dp-desc" style={{ marginTop: 6 }}><strong>Action:</strong> {decision}</p>}
          {isComplete && step?.meta?.selected_items && (
            <div style={{ marginTop: 12 }}>
              <p className="dp-desc" style={{ color: 'var(--dp-color-visited)', fontWeight: 700 }}>Selected Optimal Items:</p>
              <div className="knapsack-items">
                {weights.map((wt, idx) => {
                  const isSel = step.meta.selected_items.includes(idx);
                  return (
                    <div key={idx} className={`knapsack-item-badge ${isSel ? 'selected' : ''}`}>
                      {isSel ? '✓' : ''} Item {idx + 1} (Wt: {wt}, Val: {values[idx]})
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
