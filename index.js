import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import authRoutes from './api/auth.js';
import userRoutes from './api/cars.js';
// import Car from './models/Car.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({ 
  cloud_name: process.env.C_NAME,
  api_key: process.env.C_KEY,
  api_secret: process.env.C_SECRETKEY 
});


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 