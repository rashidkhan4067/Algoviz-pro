import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './GraphVisualization.css';

function _toString(v) { 
  return v === null || v === undefined ? '' : String(v); 
}

export default function GraphVisualization({ graph, step }) {
  const containerRef = useRef();
  
  // Refs to cache selections and simulation across step updates
  const nodeSelRef = useRef(null);
  const linkSelRef = useRef(null);
  const simulationRef = useRef(null);

  // Effect 1: Construct the D3 SVG and Force Simulation ONLY when the graph layout topology changes
  useEffect(() => {
    if (!graph || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    // Clear container and append styled SVG
    const svg = d3.select(containerRef.current).html("").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "graph-container-svg")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "block");

    // Normalize node ids by collecting both keys and neighbor destination nodes
    const uniqueNodes = new Set(Object.keys(graph).map(_toString));
    for (const sourceRaw of Object.keys(graph)) {
      const neighbors = graph[sourceRaw] || {};
      for (const targetRaw of Object.keys(neighbors)) {
        uniqueNodes.add(_toString(targetRaw));
      }
    }
    const nodes = Array.from(uniqueNodes).map(id => ({ id }));
    
    // Parse links and weights correctly from adjacency list
    const links = [];
    for (const sourceRaw of Object.keys(graph)) {
      const source = _toString(sourceRaw);
      const neighbors = graph[sourceRaw] || {};
      for (const targetRaw of Object.keys(neighbors)) {
        const target = _toString(targetRaw);
        const weight = neighbors[targetRaw];
        links.push({ source, target, weight });
      }
    }

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.08))
      .force("y", d3.forceY(height / 2).strength(0.08));

    simulationRef.current = simulation;

    // Group links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(links)
      .enter().append("g")
      .attr("class", "graph-link");

    link.append("line").attr("class", "graph-link-bg");
    link.append("line").attr("class", "graph-link-main");

    const weightBadges = link.filter(d => d.weight !== undefined && d.weight !== null)
      .append("g")
      .attr("class", "weight-badge");

    weightBadges.append("rect")
      .attr("class", "weight-badge-rect")
      .attr("width", 26)
      .attr("height", 16)
      .attr("x", -13)
      .attr("y", -8);

    weightBadges.append("text")
      .attr("class", "weight-badge-text")
      .text(d => d.weight);

    linkSelRef.current = link;

    // Group nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "graph-node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle").attr("class", "graph-node-aura");
    node.append("circle").attr("class", "graph-node-circle").attr("r", 20);
    node.append("text").attr("class", "graph-node-text").attr("text-anchor", "middle").attr("dy", ".35em").text(d => d.id);
    node.append("text").attr("class", "graph-dist-text dist-label").attr("text-anchor", "middle").attr("dy", "2.1em");

    nodeSelRef.current = node;

    // Hover interactive scaling
    node.on("mouseover", function(event, d) {
      const hoveredId = _toString(d.id);
      link.classed("highlighted", l => {
        const u = _toString(l.source.id || l.source);
        const v = _toString(l.target.id || l.target);
        return u === hoveredId || v === hoveredId;
      });
      link.classed("dimmed", l => {
        const u = _toString(l.source.id || l.source);
        const v = _toString(l.target.id || l.target);
        return u !== hoveredId && v !== hoveredId;
      });
    }).on("mouseout", function() {
      link.classed("highlighted", false);
      link.classed("dimmed", false);
    });

    simulation.on("tick", () => {
      link.selectAll(".graph-link-bg")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      link.selectAll(".graph-link-main")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      link.selectAll(".weight-badge")
        .attr("transform", d => {
          const x = (d.source.x + d.target.x) / 2;
          const y = (d.source.y + d.target.y) / 2;
          return `translate(${x},${y})`;
        });

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graph]);

  // Effect 2: Lightweight step tracking updates without clearing SVG layout or stopping physics
  useEffect(() => {
    const node = nodeSelRef.current;
    const link = linkSelRef.current;
    if (!node || !link) return;

    if (step) {
      const { type, indices, meta } = step;
      const activeNodes = (indices || []).map(_toString);
      
      let visitedNodes = [];
      let queuedNodes = [];
      let updatingNodes = [];
      let activeEdge = null;
      let mstSet = new Set();

      if (meta) {
        if (meta.visited) visitedNodes = meta.visited.map(_toString);
        if (meta.queue) queuedNodes = meta.queue.map(_toString);
        else if (meta.stack) queuedNodes = meta.stack.map(_toString);
        else if (meta.edges) queuedNodes = meta.edges.map(e => _toString(e[2]));

        if (meta.from && meta.to) {
          const u = _toString(meta.from);
          const v = _toString(meta.to);
          activeEdge = [u, v].sort().join('-');
        }

        if (meta.mst) {
          meta.mst.forEach(e => {
            const u = _toString(e[0]);
            const v = _toString(e[1]);
            mstSet.add([u, v].sort().join('-'));
          });
        }

        if (meta.parents) {
          Object.entries(meta.parents).forEach(([child, parent]) => {
            if (parent !== null && parent !== undefined && parent !== '') {
              const u = _toString(parent);
              const v = _toString(child);
              mstSet.add([u, v].sort().join('-'));
            }
          });
        }
      }

      if (type === 'update' && meta && meta.to) {
        updatingNodes = [_toString(meta.to)];
      }

      // Update node visual classes cleanly
      node.each(function(d) {
        const id = _toString(d.id);
        const el = d3.select(this);
        
        el.classed("state-active", activeNodes.includes(id));
        el.classed("state-visited", visitedNodes.includes(id) && !activeNodes.includes(id));
        el.classed("state-queued", queuedNodes.includes(id) && !activeNodes.includes(id) && !visitedNodes.includes(id));
        el.classed("state-update", updatingNodes.includes(id));
      });

      // Update link visual classes cleanly
      link.each(function(d) {
        const u = _toString(d.source.id || d.source);
        const v = _toString(d.target.id || d.target);
        const edgeId = [u, v].sort().join('-');
        const el = d3.select(this);

        const isMst = mstSet.has(edgeId);
        const isActive = activeEdge === edgeId;
        const isVisitedPath = (visitedNodes.includes(u) && visitedNodes.includes(v)) && !isMst;

        el.classed("state-mst", isMst);
        el.classed("state-discovered", isActive);
        el.classed("state-visited-path", isVisitedPath && !isActive);
      });

      // Update distance label text
      if (meta && meta.distances) {
        node.select('.dist-label')
          .text(d => {
            const val = meta.distances[_toString(d.id)];
            return val === Infinity || val === null || val === undefined ? '' : `d: ${val}`;
          });
      } else {
        node.select('.dist-label').text('');
      }
    } else {
      // Clear visual state highlights
      node.classed("state-active state-visited state-queued state-update", false);
      link.classed("state-mst state-discovered state-visited-path", false);
      node.select('.dist-label').text('');
    }
  }, [step]);

  return <div ref={containerRef} className="graph-container" />;
}
