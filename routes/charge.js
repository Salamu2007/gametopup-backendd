import express from 'express';
import Charge from '../models/charge.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';


// إعداد التخزين
const storage = multer.memoryStorage();

const upload = multer({ storage });

const router = express.Router();

// operations for charges (top-up)

router.post('/newcharge/:id', async (req, res) => {
    try {

        const {
            amount,
            quantity,
            email,
            phone,
            paymentMethod,
            dynamicData
        } = req.body;

        const gameId = req.params.id; // ✅ الصحيح

        const charge = new Charge({
            amount,
            quantity,
            gameId,
            email,
            phone,
            paymentMethod,
            dynamicData,
            status: 'waiting_verification'
        });

        await charge.save();

        res.status(201).json(charge);

    } catch (error) {
        console.error('Error creating charge:', error);
        res.status(500).json({ message: error.message });
    }
});


// Get all charges
router.get('/allcharges',authMiddleware, async (req, res) => {
    try {
        const charges = await Charge
            .find()
            .populate('gameId','name');
        res.json(charges);
    } catch (error) {
        console.error('Error fetching charges:', error);
        res.status(500).json({ message: error.message });
    }
});

// payment verification endpoint
router.put('/approve/:id',authMiddleware, async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Charge not found' });

    charge.status = "paid";
    await charge.save();

    res.json(charge);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm/:id', upload.single('proofImage'), async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Charge not found' });

    if (req.file) {
      // رفع الصورة إلى Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gametopupdz/charges',
            public_id: `charge-proof-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            resource_type: 'auto'
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
      charge.proofImageUrl = result.secure_url;
    }

    charge.status = 'waiting_verification';

    await charge.save();

    res.json({ message: 'Proof uploaded successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// cofirm charge
router.put('/confirm/:id',authMiddleware, async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Order not found' });

    charge.status = "waiting_verification";

    await charge.save();

    res.json(charge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/paymentcharge/:id', async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id)
      .populate('gameId', 'name image');

    if (!charge) {
      return res.status(404).json({ message: 'Charge not found' });
    }

    res.json({
      chargeId: charge._id,
      name: charge.gameId?.name,
      image: charge.gameId?.image,
      price: charge.amount,       // amount paid
      quantity: charge.quantity,  // top-up quantity if available
      paymentMethod: charge.paymentMethod,
      status: charge.status,
      email: charge.email || null,
      dynamicData: charge.dynamicData ? Object.fromEntries(charge.dynamicData) : {}
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;



