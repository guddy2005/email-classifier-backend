// config/db.js
const mongoose = require('mongoose');

// Silence deprecation message and lock behavior
mongoose.set('strictQuery', true);

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/email-classifier';

  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(mongoUri)) {
    console.error('MongoDB URI not set for production. Please set MONGODB_URI to your cloud MongoDB connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error?.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;