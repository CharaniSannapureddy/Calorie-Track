const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Calorie = require('./models/Calorie');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Nutrition API Endpoint (Using CalorieNinjas API)
app.get('/api/nutrition', async (req, res) => {
  const query = req.query.query;
  const apiKey = 'ctQsOImCCoLRHG2vlxvCwg==ju1dGVMGYIgDk619';

  try {
    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': apiKey,
        },
      }
    );

    console.log(
      `CalorieNinjas API response for query "${query}":`,
      response.data
    );

    const items = response.data.items || [];
    if (!items.length) {
      throw new Error('No nutritional data found for this query');
    }

    const transformedData = items.map(item => ({
      name: item.name,
      calories: item.calories || 0,
      serving_size_g: item.serving_size_g || 100,
      fat_total_g: item.fat_total_g || 0,
      fat_saturated_g: item.fat_saturated_g || 0,
      protein_g: item.protein_g || 0,
      sodium_mg: item.sodium_mg || 0,
      potassium_mg: item.potassium_mg || 0,
      cholesterol_mg: item.cholesterol_mg || 0,
      carbohydrates_total_g: item.carbohydrates_total_g || 0,
      fiber_g: item.fiber_g || 0,
      sugar_g: item.sugar_g || 0,
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching nutrition data:', error.message);
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    res
      .status(500)
      .json({ error: 'Failed to fetch nutrition data: ' + error.message });
  }
});

// Save Calorie Data Endpoint
app.post('/api/calories', async (req, res) => {
  const { userId, foodItem, nutritionalValues, date } = req.body;

  try {
    const calorieEntry = new Calorie({
      userId,
      foodItem,
      nutritionalValues,
      date: date ? new Date(date) : new Date(),
    });

    await calorieEntry.save();
    res.status(201).json({ message: 'Calorie data saved successfully' });
  } catch (error) {
    console.error('Error saving calorie data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch Daily Trends Endpoint (Updated to Handle userId as String)
app.get('/api/daily-trends', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Check if the database connection is active
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not active');
    }

    // Aggregate calorie data by date, treating userId as a string
    const dailyCalories = await Calorie.aggregate([
      {
        $match: {
          userId: userId, // Treat userId as a string
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          totalCalories: { $sum: { $ifNull: ['$nutritionalValues.calories', 0] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: '$_id',
          totalCalories: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(dailyCalories);
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});