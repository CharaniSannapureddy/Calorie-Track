import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './DailyTrends.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DailyTrends = () => {
  const [calorieData, setCalorieData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDailyTrends = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        console.log('Fetching trends for userId:', userId);
        if (!userId) {
          setError('User not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/daily-trends`, {
          params: { userId },
        });

        const data = response.data;
        console.log('API Response:', data);

        if (!data || data.length === 0) {
          setError('No calorie data available.');
          setLoading(false);
          return;
        }

        const chartData = data.map(entry => ({
          date: entry.date,
          calories: entry.totalCalories || 0,
        }));

        setCalorieData(chartData);
        setError('');
      } catch (error) {
        console.error('Error fetching daily trends:', error.response?.data || error.message);
        const errorMessage = error.response
          ? `Failed to fetch daily trends: ${error.response.data.message || error.response.statusText}`
          : `Failed to fetch daily trends: ${error.message}`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyTrends();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('nutritionData');
    localStorage.removeItem('aggregatedData');
    localStorage.removeItem('totalCalories');
    localStorage.removeItem('searchQuery');
    localStorage.removeItem('multiInputs');
    navigate('/');
  };

  const handleBarClick = (data) => {
    if (data && data.calories) {
      alert(`${data.date}: ${data.calories.toFixed(2)} kcal`);
    }
  };

  const tooltipStyle = theme === 'light'
    ? { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', color: '#333', border: 'none' }
    : { backgroundColor: '#263238', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', color: '#e0e0e0', border: '1px solid #546e7a' };

  return (
    <div className={`trends-container ${theme}`}>
      <div className="header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <h1 className="title">📊 Daily Calorie Trends</h1>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {calorieData.length > 0 ? (
        <div className="content-section">
          <div className="chart-card">
            <h2>Total Calories by Date</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={calorieData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ecc71" />
                    <stop offset="100%" stopColor="#27ae60" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="date" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
                <Bar
                  dataKey="calories"
                  fill="url(#barGradient)"
                  className="chart-bar"
                  name="Calories (kcal)"
                  onClick={handleBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        !loading && !error && <p className="no-data-message">No data available to display.</p>
      )}

      <div className="footer-button">
        <button className="back-button" onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default DailyTrends;