import express from 'express';
import Game from '../models/game.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// تكوين multer لتحميل الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // التأكد من وجود المجلد
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'game-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products
router.get('/', authMiddleware , async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });   
    }
});

// تحميل صورة
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Get product of charge
router.get('/charges', async (req, res) => {
    try {
        const charges = await Game.find({ type: 'charge' }).lean();

        // جهز imageUrl لكل لعبة
        const preparedCharges = charges.map(game => {
            return {
                ...game,
                imageUrl: game.image ? 
                    (game.image.startsWith('/uploads/') ? 
                        `http://localhost:3000${game.image}` : 
                        game.image) : 
                    '/assets/images/default.png',
                currencyType: game.currencyType || 'UC'
            };
        });

        res.json(preparedCharges);
    } catch (error) {
        console.error('Error fetching charges:', error);
        res.status(500).json({ message: error.message });   
    }
});


//Get product of order
router.get('/orders', async (req, res) => {
    try {
        const orders = await Game.find({ type: 'game' })
            .select('-__v')
            .lean();

        const preparedOrders = orders.map(game => ({
            ...game,
            imageUrl: game.image ? 
                (game.image.startsWith('/uploads/') ? 
                    `http://localhost:3000${game.image}` : 
                    game.image) : 
                '/assets/images/default.png'
        }));

        res.json(preparedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
});


// Create a new product
router.post('/create', authMiddleware, async (req, res) => {
    const newGame = new Game(req.body);
    try {
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update a product
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGame) {
            return res.status(404).json({ message: 'Product not found' });
        }else{
            res.json(updatedGame);
            res.status(200).json({ message: 'Product updated successfully' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a product by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Prepare the game object with proper image URL
        const preparedGame = {
            ...game.toObject(),
            image: game.image ? 
                (game.image.startsWith('/uploads/') ? 
                    `http://localhost:3000${game.image}` : 
                    game.image) : 
                '/assets/images/default.png'
        };
        
        res.json(preparedGame);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: error.message });
    }
});


export default router;



