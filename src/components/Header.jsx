import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="topbar premium-topbar">
      <div className="topnav">
        <Link to="/" className="logo">
          AlgoViz Pro
        </Link>
        <Link to="/explore" className="link">
          Explore
        </Link>
        <Link to="/docs" className="link">
          Docs
        </Link>
        <Link to="/compare" className="link">
          Compare Arena
        </Link>
      </div>
      <div className="topbar-actions">
        <Link to="/sandbox">
          <button className="upgrade-btn" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, var(--neon-cyan), #0891b2)', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '800', cursor: 'pointer', boxShadow: '0 0 10px rgba(6,182,212,0.2)' }}>Sandbox Studio</button>
        </Link>
      </div>
    </header>
  );
}
