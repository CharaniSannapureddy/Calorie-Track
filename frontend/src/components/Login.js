import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });
      localStorage.setItem('userId', response.data.userId);
      // Remove token storage since backend doesn't provide a token
      setMessage('Login successful');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check the backend connection.'
      );
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <p>
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;