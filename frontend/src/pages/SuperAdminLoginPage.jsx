import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SuperAdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Start with EMPTY fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');

    // Prevent empty/space-only submission
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      // Make sure this is actually a Super Admin
      if (res.data.role !== 'SUPER_ADMIN') {
        setError('This account is not a Super Admin account.');
        setLoading(false);
        return;
      }

      // Store authentication data
      login(res.data);

      // Go to Super Admin dashboard
      navigate('/super-admin/dashboard');

    } catch (err) {
      console.error('Super Admin login failed:', err);

      setError(
        err.response?.data?.message ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7f9',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '400px',
          maxWidth: '100%',
          background: 'white',
          padding: '35px',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
          boxSizing: 'border-box'
        }}
      >

        {/* ==============================
            HEADER
        ============================== */}

        <h1
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            color: '#0f172a'
          }}
        >
          Super Admin Login
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px'
          }}
        >
          VetMonk AI Platform Administration
        </p>

        {/* ==============================
            ERROR MESSAGE
        ============================== */}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          >
            {error}
          </div>
        )}

        {/* ==============================
            LOGIN FORM
        ============================== */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label
            htmlFor="superAdminEmail"
            style={{
              display: 'block',
              color: '#334155',
              fontWeight: '500'
            }}
          >
            Email Address
          </label>

          <input
            id="superAdminEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              marginBottom: '18px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />

          {/* PASSWORD */}

          <label
            htmlFor="superAdminPassword"
            style={{
              display: 'block',
              color: '#334155',
              fontWeight: '500'
            }}
          >
            Password
          </label>

          <input
            id="superAdminPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '6px',
              marginBottom: '25px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#6ee7b7' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In as Super Admin'}
          </button>

        </form>

        {/* ==============================
            BACK TO LOGIN
        ============================== */}

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </button>
        </div>

      </div>
    </div>
  );
};