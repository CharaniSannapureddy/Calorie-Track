import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        username,
        password,
      });
      setMessage(response.data.message);
      setError('');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check the backend connection.'
      );
      setMessage('');
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <div className="register-box">
          <h2>Register</h2>
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
            <button type="submit">Register</button>
          </form>
          <p>
            Already have an account? <Link to="/">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;