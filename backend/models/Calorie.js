const mongoose = require ('mongoose');

const calorieSchema = new mongoose.Schema ({
  userId: {
    type: String, // Temporarily change to String to accept mock-user-id
    required: true,
  },
  foodItem: {
    type: String,
    required: true,
  },
  nutritionalValues: {
    type: Object,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('Calorie', calorieSchema);
