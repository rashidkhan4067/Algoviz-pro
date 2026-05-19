import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TreeVisualization.css';

export default function TreeVisualization({ tree, step }) {
  const containerRef = useRef();

  // Refs to cache D3 node and link selections across updates
  const nodeSelRef = useRef(null);
  const linkSelRef = useRef(null);

  // Effect 1: Initialize the static tree coordinates and elements only when graph hierarchy structure changes
  useEffect(() => {
    if (!tree || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    // Helper to generate a tree hierarchy from an adjacency map
    function buildHierarchy(adj, rootName) {
      const seen = new Map();
      function build(name) {
        if (seen.has(name)) return seen.get(name);
        const node = { name };
        seen.set(name, node);
        const children = adj[name] || [];
        if (children && children.length) {
          node.children = children.map(c => build(c));
        }
        return node;
      }
      return build(rootName);
    }

    let rootData = tree;
    if (!tree.name && !tree.children) {
      const keys = Object.keys(tree);
      const rootName = keys && keys.length ? keys[0] : null;
      rootData = buildHierarchy(tree, rootName);
    }

    const root = d3.hierarchy(rootData);
    const treeLayout = d3.tree().size([width - 80, height - 100]);
    treeLayout(root);

    // Create SVG and append group offset
    const svg = d3.select(containerRef.current).html("").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "tree-container-svg")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "block")
      .append("g")
      .attr("transform", "translate(40,40)");

    // Vertical Bezier curve generator
    const linkGenerator = d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    // Render tree links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "tree-link")
      .attr("d", linkGenerator);

    linkSelRef.current = link;

    // Render tree node groups
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "tree-node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Outer aura circle for scaling expansions
    node.append("circle")
      .attr("class", "tree-node-aura");

    // Main inner node circle
    node.append("circle")
      .attr("class", "tree-node-circle")
      .attr("r", 20);

    // Center text label
    node.append("text")
      .attr("class", "tree-node-text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(d => d.data.name || d.data);

    nodeSelRef.current = node;

  }, [tree]);

  // Effect 2: Lightweight step tracking updates without clearing SVG layout
  useEffect(() => {
    const node = nodeSelRef.current;
    const link = linkSelRef.current;
    if (!node || !link) return;

    if (step) {
      const { type, indices, meta } = step;
      const activeNodes = (indices || []).map(String);
      let visitedNodes = [];
      let stackNodes = [];

      if (meta) {
        if (meta.traversal) visitedNodes = meta.traversal.map(String);
        if (meta.stack) stackNodes = meta.stack.map(String);
      }

      // Apply state classes to nodes
      node.each(function(d) {
        const name = String(d.data.name || d.data);
        const el = d3.select(this);

        const isActive = activeNodes.includes(name);
        const isVisited = visitedNodes.includes(name) && !isActive;
        const isStack = stackNodes.includes(name) && !isActive && !isVisited;

        el.classed("state-active", isActive);
        el.classed("state-visited", isVisited);
        el.classed("state-stack", isStack);
      });

      // Apply state classes to traversed links
      link.each(function(d) {
        const sourceName = String(d.source.data.name || d.source.data);
        const targetName = String(d.target.data.name || d.target.data);
        const el = d3.select(this);

        const isSourceVisited = visitedNodes.includes(sourceName) || activeNodes.includes(sourceName);
        const isTargetVisited = visitedNodes.includes(targetName) || activeNodes.includes(targetName);

        const isActive = activeNodes.includes(targetName) && isSourceVisited;
        const isVisited = isSourceVisited && isTargetVisited && !isActive;

        el.classed("state-active", isActive);
        el.classed("state-visited", isVisited);
      });
    } else {
      // Clear visual state highlights
      node.classed("state-active state-visited state-stack", false);
      link.classed("state-active state-visited", false);
    }
  }, [step]);

  return <div ref={containerRef} className="tree-container" />;
}
