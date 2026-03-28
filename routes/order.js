import express from 'express';
import Game from '../models/game.js';
import Order from '../models/order.js';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';


// إعداد التخزين
const storage = multer.memoryStorage();

const upload = multer({ storage });


const router = express.Router();

// Create a new order
router.post('/neworder/:id', async (req, res) => {
  try {
    const { quantity, email, phone, paymentMethod } = req.body;
    const productId = req.params.id;
    // 1️⃣ نجيب بيانات اللعبة من قاعدة البيانات
    const game = await Game.findById(productId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // 2️⃣ نحدد unitPrice و totalPrice
    const unitPrice = game.price;
    const totalPrice = unitPrice * quantity;

    // 3️⃣ نخلق order جديد
    const order = new Order({
      productId,
      quantity,
      unitPrice,
      totalPrice,
      email,
      phone,
      paymentMethod,
      status: 'waiting_verification'
    });

    // 4️⃣ نحفظه في قاعدة البيانات
    await order.save();

    res.status(201).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm/:id', upload.single('proofImage'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.file) {
      // رفع الصورة إلى Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gametopupdz/orders',
            public_id: `order-proof-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
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
      order.proofImageUrl = result.secure_url;
    }

    order.status = 'waiting_verification';

    await order.save();

    res.json({ message: 'Payment proof uploaded successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// cofirm order
router.put('/confirm/:id',authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = "waiting_verification";

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/paymentorder/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      name: order.productId?.name,
      image: order.productId?.image,
      unitPrice: order.unitPrice,           // send stored unit price
      totalPrice: order.totalPrice,         // also send total
      price: order.productId?.price,        // original product price for reference
      quantity: order.quantity,
      paymentMethod: order.paymentMethod,
      status: order.status,
      email: order.email || null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// reject order
router.put('/reject/:id',authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(
        req.params.id
    );
    if(!order){
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = "rejected";
    await order.save();
    res.json(order);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;





