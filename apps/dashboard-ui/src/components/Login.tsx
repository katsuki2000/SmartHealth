import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Identifiants invalides');
      }

      const data = await res.json();
      login(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🏥</div>
          <h1 className="login-title">SmartHealth</h1>
          <p className="login-subtitle">Portail Clinique Sécurisé</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <div className="login-group">
            <label className="login-label" htmlFor="email">Identifiant Professionnel</label>
            <input
              id="email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Dr. Rakoto (admin@smarthealth.com)"
              required
            />
          </div>

          <div className="login-group">
            <label className="login-label" htmlFor="password">Mot de passe</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading || !email || !password}>
            {loading ? 'Validation des accès...' : 'Se connecter au portail'}
          </button>
        </form>

      </div>
    </div>
  );
}
