import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-quiz-helper';
    await mongoose.connect(connectionString);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
};