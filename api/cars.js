// carRoute.js
import express from 'express';
import multer from 'multer';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';
import cloudinary from '../config/cloudinaryConfig.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().populate('owner', 'username');
    console.log(cars)
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's cars
router.get('/user/:userId', auth, async (req, res) => {
  try { 
    const cars = await Car.find({ owner: req.params.userId });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'username');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cars - Create a new car with image upload
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const imageUrls = [];

    // Upload images to Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.buffer.toString('base64')}`, {
        resource_type: 'image',
        folder: 'car_images',
      });
      imageUrls.push(result.secure_url);
    }

    const car = new Car({
      title,
      description,
      images: imageUrls,
      tags: JSON.parse(tags),
      owner: req.user.id,
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cars/:id - Update an existing car with new images
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags, existingImages } = req.body;
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const imageUrls = existingImages ? JSON.parse(existingImages) : [];

    // Upload new images to Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.buffer.toString('base64')}`, {
        resource_type: 'image',
        folder: 'car_images',
      });
      imageUrls.push(result.secure_url);
    }

    car.title = title;
    car.description = description;
    car.images = imageUrls;
    car.tags = JSON.parse(tags);

    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cars/:id - Delete a car
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await car.deleteOne();
    res.json({ message: 'Car removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
