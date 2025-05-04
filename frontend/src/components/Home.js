import axios from 'axios';
import React, {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import {
  FaBolt,
  FaCandyCane,
  FaCarrot,
  FaDumbbell,
  FaLeaf,
  FaMoon,
  FaSun,
  FaWeight,
} from 'react-icons/fa';
import {useNavigate} from 'react-router-dom';
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
import gymIcon from '../assets/gym.png';
import jogIcon from '../assets/jog.png';
import walkIcon from '../assets/walk.png';
import yogaIcon from '../assets/yoga.png';
import './Home.css';

const Home = () => {
  const [multiInputs, setMultiInputs] = useState ([]);
  const [searchQuery, setSearchQuery] = useState ('');
  const [nutritionData, setNutritionData] = useState ([]);
  const [aggregatedData, setAggregatedData] = useState ({
    calories: 0,
    serving_size_g: 0,
    carbohydrates_total_g: 0,
    fat_saturated_g: 0,
    fat_total_g: 0,
    fiber_g: 0,
    potassium_mg: 0,
    protein_g: 0,
    sodium_mg: 0,
    sugar_g: 0,
  });
  const [totalCalories, setTotalCalories] = useState (0);
  const [error, setError] = useState ('');
  const [loading, setLoading] = useState (false);
  const [showConfetti, setShowConfetti] = useState (false);
  const [theme, setTheme] = useState ('light');
  const navigate = useNavigate ();

  // Load data from localStorage on component mount
  useEffect (() => {
    const savedData = localStorage.getItem ('nutritionData');
    const savedAggregatedData = localStorage.getItem ('aggregatedData');
    const savedTotalCalories = localStorage.getItem ('totalCalories');
    const savedSearchQuery = localStorage.getItem ('searchQuery');
    const savedMultiInputs = localStorage.getItem ('multiInputs');

    if (savedData) setNutritionData (JSON.parse (savedData));
    if (savedAggregatedData)
      setAggregatedData (JSON.parse (savedAggregatedData));
    if (savedTotalCalories) setTotalCalories (Number (savedTotalCalories));
    if (savedSearchQuery) setSearchQuery (savedSearchQuery);
    if (savedMultiInputs) setMultiInputs (JSON.parse (savedMultiInputs));
  }, []);

  const handleAddInput = () => {
    const updatedInputs = [...multiInputs, ''];
    setMultiInputs (updatedInputs);
    localStorage.setItem ('multiInputs', JSON.stringify (updatedInputs));
  };

  const handleRemoveInput = index => {
    const updatedInputs = [...multiInputs];
    updatedInputs.splice (index, 1);
    setMultiInputs (updatedInputs);
    localStorage.setItem ('multiInputs', JSON.stringify (updatedInputs));
  };

  const handleInputChange = (index, value) => {
    const updatedInputs = [...multiInputs];
    updatedInputs[index] = value;
    setMultiInputs (updatedInputs);
    localStorage.setItem ('multiInputs', JSON.stringify (updatedInputs));
  };

  const handleClearSearch = () => {
    setSearchQuery ('');
    setMultiInputs ([]);
    setNutritionData ([]);
    setAggregatedData ({
      calories: 0,
      serving_size_g: 0,
      carbohydrates_total_g: 0,
      fat_saturated_g: 0,
      fat_total_g: 0,
      fiber_g: 0,
      potassium_mg: 0,
      protein_g: 0,
      sodium_mg: 0,
      sugar_g: 0,
    });
    setTotalCalories (0);
    setError ('');
    // Clear localStorage
    localStorage.removeItem ('nutritionData');
    localStorage.removeItem ('aggregatedData');
    localStorage.removeItem ('totalCalories');
    localStorage.removeItem ('searchQuery');
    localStorage.removeItem ('multiInputs');
  };

  const handleSearch = async () => {
    if (!searchQuery && multiInputs.length === 0) {
      setError ('Please enter at least one food item to search');
      return;
    }
    setError ('');
    setLoading (true);
    try {
      const allQueries = [searchQuery, ...multiInputs].filter (
        query => query.trim () !== ''
      );
      if (allQueries.length === 0) {
        setError ('Please enter at least one food item to search');
        setLoading (false);
        return;
      }
      const responses = await Promise.all (
        allQueries.map (async query => {
          const response = await axios.get (
            'http://localhost:5000/api/nutrition',
            {
              params: {query},
            }
          );
          return response.data;
        })
      );
      const allData = responses.flat ();
      const hasRestrictedData = allData.some (
        item =>
          typeof item.calories === 'string' &&
          item.calories.includes ('premium subscribers')
      );
      if (hasRestrictedData) {
        setError (
          'Some nutritional data (e.g., calories) is only available for premium API subscribers.'
        );
        setLoading (false);
        return;
      }
      const aggregated = allData.reduce (
        (acc, item) => ({
          calories: acc.calories +
            (typeof item.calories === 'number' ? item.calories : 0),
          serving_size_g: acc.serving_size_g +
            (typeof item.serving_size_g === 'number' ? item.serving_size_g : 0),
          carbohydrates_total_g: acc.carbohydrates_total_g +
            (typeof item.carbohydrates_total_g === 'number'
              ? item.carbohydrates_total_g
              : 0),
          fat_saturated_g: acc.fat_saturated_g +
            (typeof item.fat_saturated_g === 'number'
              ? item.fat_saturated_g
              : 0),
          fat_total_g: acc.fat_total_g +
            (typeof item.fat_total_g === 'number' ? item.fat_total_g : 0),
          fiber_g: acc.fiber_g +
            (typeof item.fiber_g === 'number' ? item.fiber_g : 0),
          potassium_mg: acc.potassium_mg +
            (typeof item.potassium_mg === 'number' ? item.potassium_mg : 0),
          protein_g: acc.protein_g +
            (typeof item.protein_g === 'number' ? item.protein_g : 0),
          sodium_mg: acc.sodium_mg +
            (typeof item.sodium_mg === 'number' ? item.sodium_mg : 0),
          sugar_g: acc.sugar_g +
            (typeof item.sugar_g === 'number' ? item.sugar_g : 0),
        }),
        {
          calories: 0,
          serving_size_g: 0,
          carbohydrates_total_g: 0,
          fat_saturated_g: 0,
          fat_total_g: 0,
          fiber_g: 0,
          potassium_mg: 0,
          protein_g: 0,
          sodium_mg: 0,
          sugar_g: 0,
        }
      );
      console.log ('Aggregated Data:', aggregated);
      setAggregatedData (aggregated);
      setTotalCalories (Number (aggregated.calories) || 0);
      const graphData = [
        {name: 'Carbohydrates', value: aggregated.carbohydrates_total_g},
        {name: 'Saturated Fat', value: aggregated.fat_saturated_g},
        {name: 'Total Fat', value: aggregated.fat_total_g},
        {name: 'Fiber', value: aggregated.fiber_g},
        {name: 'Potassium', value: aggregated.potassium_mg},
        {name: 'Protein', value: aggregated.protein_g},
        {name: 'Sodium', value: aggregated.sodium_mg},
        {name: 'Sugar', value: aggregated.sugar_g},
      ];
      setNutritionData (graphData);
      const userId = localStorage.getItem ('userId');
      const token = localStorage.getItem ('token');
      await axios.post (
        'http://localhost:5000/api/calories',
        {
          userId,
          foodItem: allQueries.join (', '),
          nutritionalValues: aggregated,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      setError ('');
      setShowConfetti (true);
      // Save to localStorage
      localStorage.setItem ('nutritionData', JSON.stringify (graphData));
      localStorage.setItem ('aggregatedData', JSON.stringify (aggregated));
      localStorage.setItem ('totalCalories', aggregated.calories.toString ());
      localStorage.setItem ('searchQuery', searchQuery);
      localStorage.setItem ('multiInputs', JSON.stringify (multiInputs));
    } catch (error) {
      console.error ('Error fetching or saving calorie data:', error.message);
      setError ('Failed to fetch or save calorie data: ' + error.message);
    } finally {
      setLoading (false);
    }
  };

  const handleShareResults = () => {
    const text = `
      Nutritional Values for "${[searchQuery, ...multiInputs]
                                .filter (q => q)
                                .join (', ')}":
      Total Calories: ${totalCalories.toFixed (2)} kcal
      Serving Size: ${aggregatedData.serving_size_g.toFixed (2)}g
      Carbohydrates: ${aggregatedData.carbohydrates_total_g.toFixed (2)}g
      Saturated Fat: ${aggregatedData.fat_saturated_g.toFixed (2)}g
      Total Fat: ${aggregatedData.fat_total_g.toFixed (2)}g
      Fiber Content: ${aggregatedData.fiber_g.toFixed (2)}g
      Potassium: ${aggregatedData.potassium_mg.toFixed (2)}mg
      Protein: ${aggregatedData.protein_g.toFixed (2)}g
      Sodium: ${aggregatedData.sodium_mg.toFixed (2)}mg
      Sugar: ${aggregatedData.sugar_g.toFixed (2)}g
    `;
    navigator.clipboard.writeText (text).then (() => {
      alert ('Results copied to clipboard!');
    });
  };

  const toggleTheme = () => {
    setTheme (theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem ('userId');
    localStorage.removeItem ('token');
    localStorage.removeItem ('nutritionData');
    localStorage.removeItem ('aggregatedData');
    localStorage.removeItem ('totalCalories');
    localStorage.removeItem ('searchQuery');
    localStorage.removeItem ('multiInputs');
    navigate ('/');
  };

  const calculateExerciseDuration = (calories, caloriesPerMinute) => {
    return Math.round (calories / caloriesPerMinute) || 0;
  };

  const handleBarClick = data => {
    if (data && data.value) {
      alert (`${data.name}: ${data.value.toFixed (2)}`);
    }
  };

  const joggingMinutes = calculateExerciseDuration (totalCalories, 10);
  const yogaMinutes = calculateExerciseDuration (totalCalories, 5);
  const gymMinutes = calculateExerciseDuration (totalCalories, 8);
  const walkingMinutes = calculateExerciseDuration (totalCalories, 4);

  const graphData = nutritionData.length
    ? nutritionData
    : [
        {name: 'Carbohydrates', value: 0},
        {name: 'Saturated Fat', value: 0},
        {name: 'Total Fat', value: 0},
        {name: 'Fiber', value: 0},
        {name: 'Potassium', value: 0},
        {name: 'Protein', value: 0},
        {name: 'Sodium', value: 0},
        {name: 'Sugar', value: 0},
      ];

  const tooltipStyle = theme === 'light'
    ? {
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        color: '#333',
        border: 'none',
      }
    : {
        backgroundColor: '#263238',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        color: '#e0e0e0',
        border: '1px solid #546e7a',
      };

  return (
    <div className={`home-container ${theme}`}>
      {showConfetti &&
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          onConfettiComplete={() => setShowConfetti (false)}
        />}
      <div className="header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <h1 className="title">🔥 Foodie</h1>
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search food item (e.g., dosa, apple)..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery (e.target.value);
              localStorage.setItem ('searchQuery', e.target.value);
            }}
          />
        </div>
        <div className="multi-inputs-container">
          {multiInputs.map ((input, index) => (
            <div key={index} className="multi-input">
              <input
                type="text"
                placeholder={`Enter food item ${index + 1}`}
                value={input}
                onChange={e => handleInputChange (index, e.target.value)}
              />
              <button
                className="remove-btn"
                onClick={() => handleRemoveInput (index)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
        <div className="search-buttons">
          <button className="action-button" onClick={handleAddInput}>
            Add Multiple Items
          </button>
          <button onClick={handleSearch} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Calculate Calories'}
          </button>
          <button onClick={handleClearSearch} className="clear-btn">
            Clear Search
          </button>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="content-section">
        <div className="nutrition-card">
          <h2>Nutritional Values</h2>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <FaBolt className="nutrition-icon" />
              <span>
                <strong>Total Calories:</strong>
                {' '}
                {totalCalories.toFixed (2)}
                {' '}
                kcal
              </span>
            </div>
            <div className="nutrition-item">
              <FaWeight className="nutrition-icon" />
              <span>
                <strong>Serving Size:</strong>
                {' '}
                {aggregatedData.serving_size_g.toFixed (2)}
                g
              </span>
            </div>
            <div className="nutrition-item">
              <FaCarrot className="nutrition-icon" />
              <span>
                Carbohydrates:
                {' '}
                {aggregatedData.carbohydrates_total_g.toFixed (2)}
                g
              </span>
            </div>
            <div className="nutrition-item">
              <FaDumbbell className="nutrition-icon" />
              <span>
                Saturated Fat: {aggregatedData.fat_saturated_g.toFixed (2)}g
              </span>
            </div>
            <div className="nutrition-item">
              <FaDumbbell className="nutrition-icon" />
              <span>Total Fat: {aggregatedData.fat_total_g.toFixed (2)}g</span>
            </div>
            <div className="nutrition-item">
              <FaLeaf className="nutrition-icon" />
              <span>Fiber Content: {aggregatedData.fiber_g.toFixed (2)}g</span>
            </div>
            <div className="nutrition-item">
              <FaCarrot className="nutrition-icon" />
              <span>
                Potassium: {aggregatedData.potassium_mg.toFixed (2)}mg
              </span>
            </div>
            <div className="nutrition-item">
              <FaDumbbell className="nutrition-icon" />
              <span>Protein: {aggregatedData.protein_g.toFixed (2)}g</span>
            </div>
            <div className="nutrition-item">
              <FaCarrot className="nutrition-icon" />
              <span>Sodium: {aggregatedData.sodium_mg.toFixed (2)}mg</span>
            </div>
            <div className="nutrition-item">
              <FaCandyCane className="nutrition-icon" />
              <span>Sugar: {aggregatedData.sugar_g.toFixed (2)}g</span>
            </div>
          </div>
          <button className="share-btn" onClick={handleShareResults}>
            Share Results
          </button>
        </div>
        <div className="exercise-card">
          <h2>To burn {totalCalories.toFixed (2)} calories you will have to</h2>
          <div className="exercise-grid">
            <div className="exercise-item">
              <img src={jogIcon} alt="Jog" />
              <span className="exercise-tooltip">
                Jog — you will have to jog for {joggingMinutes} minutes
                <span className="tooltip-text">
                  Burns ~10 calories per minute
                </span>
              </span>
            </div>
            <div className="exercise-item">
              <img src={yogaIcon} alt="Power Yoga" />
              <span className="exercise-tooltip">
                Power Yoga — you will have to do yoga for {yogaMinutes} minutes
                <span className="tooltip-text">
                  Burns ~5 calories per minute
                </span>
              </span>
            </div>
            <div className="exercise-item">
              <img src={gymIcon} alt="Gym Workout" />
              <span className="exercise-tooltip">
                Gym Workout — you will have to lift weights for
                {' '}
                {gymMinutes}
                {' '}
                minutes
                <span className="tooltip-text">
                  Burns ~8 calories per minute
                </span>
              </span>
            </div>
            <div className="exercise-item">
              <img src={walkIcon} alt="Brisk Walk" />
              <span className="exercise-tooltip">
                Brisk Walk — you will have to walk for {walkingMinutes} minutes
                <span className="tooltip-text">
                  Burns ~4 calories per minute
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="graph-section">
        <h2>Nutritional Value Graph</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#27ae60" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
            <XAxis dataKey="name" className="chart-axis" />
            <YAxis className="chart-axis" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{fontSize: '14px', fontWeight: 600}} />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              className="chart-bar"
              name="Nutritional Values"
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="footer-button">
        <button
          className="trends-button"
          onClick={() => navigate ('/daily-trends')}
        >
          View Daily Trends
        </button>
      </div>
    </div>
  );
};

export default Home;
