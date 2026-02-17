import React, { useState } from 'react';
import { login, signup } from '../services/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignup) {
        // Signup
        const response = await signup(formData);
        setMessage('✅ Signup successful! Please login.');
        setFormData({ name: '', email: '', password: '' });
        setIsSignup(false);
      } else {
        // Login
        const response = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.success) {
          setMessage('✅ Login successful!');
          onLoginSuccess(response.data.user);
        }
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignup ? 'Sign Up' : 'Login'}</h1>
        
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="toggle-text">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage('');
              setFormData({ name: '', email: '', password: '' });
            }}
            className="toggle-btn"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;