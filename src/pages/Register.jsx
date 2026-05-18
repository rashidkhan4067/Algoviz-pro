import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to register');
      }
    } catch (error) {
      alert('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-view">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p className="muted">Join AlgoViz PRO to unlock premium visualization features</p>
        </div>
        
        <div className="card auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="muted">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign In</Link>
            </p>
          </div>
        </div>
        
        <div className="auth-footer-info">
          <p className="muted">© 2025 AlgoViz PRO. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
