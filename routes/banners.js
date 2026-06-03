import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import authMiddleware from '../middleware/authMiddleware.js';
import Banner from '../models/Banner.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all banners, optionally active only
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') {
      filter.isActive = true;
    }

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gametopupdz/banners',
          public_id: `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      message: 'Banner image uploaded successfully',
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading banner image to Cloudinary:', error);
    res.status(500).json({ message: 'Failed to upload banner image', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const oldPublicId = banner.imagePublicId;
    const updatedData = req.body;

    // Clean up previous image on Cloudinary if a new public id is provided
    if (updatedData.imagePublicId && oldPublicId && updatedData.imagePublicId !== oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' });
      } catch (destroyError) {
        console.warn('Warning: failed to destroy old banner image:', destroyError.message);
      }
    }

    Object.assign(banner, updatedData);
    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    if (banner.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(banner.imagePublicId, { resource_type: 'image' });
      } catch (destroyError) {
        console.warn('Could not delete Cloudinary image:', destroyError.message);
      }
    }

    await banner.deleteOne();
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
