import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

import DailyTrends from './components/DailyTrends'; // Added import for DailyTrends

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/daily-trends" element={<DailyTrends />} /> {/* Added new route */}
      </Routes>
    </Router>
  );
}

export default App;