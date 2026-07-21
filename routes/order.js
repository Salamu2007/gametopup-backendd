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
    const { quantity, email, phone, paymentMethod, dynamicData, username } = req.body;
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
      username: username || email?.split('@')[0] || 'مستخدم',
      email,
      phone,
      paymentMethod,
      status: 'waiting_verification',
      dynamicData
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

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userName = req.user?.username;

    if (!userEmail && !userName) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({
      $or: [
        { email: userEmail },
        { username: userName }
      ]
    })
      .populate('productId', 'name image price currency')
      .sort({ createdAt: -1 });

    const mappedOrders = orders.map((order) => ({
      _id: order._id,
      gameName: order.productId?.name || 'غير معروف',
      gameImage: order.productId?.image
        ? (order.productId.image.startsWith('/uploads/')
            ? `${process.env.BASE_URL || 'http://localhost:3000'}${order.productId.image}`
            : order.productId.image)
        : '/assets/images/default.png',
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      username: order.username || order.email?.split('@')[0] || 'مستخدم',
      email: order.email,
      status: order.status,
      deliveredData: order.deliveredData || null,
      createdAt: order.createdAt
    }));

    return res.json(mappedOrders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'completed' || order.status === 'paid') {
      return res.status(400).json({ message: 'Order already completed' });
    }

    const game = await Game.findById(order.productId);
    if (!game) {
      return res.status(404).json({ message: 'Linked game not found' });
    }

    const quantityNeeded = Number(order.quantity || 1);
    const hasEnoughInventory = (game.accounts?.length || 0) >= quantityNeeded && (Number(game.stock) || 0) >= quantityNeeded;

    if (!hasEnoughInventory) {
      return res.status(400).json({ message: 'No enough stock/accounts available for this order' });
    }

    const deliveredAccounts = (game.accounts || []).slice(0, quantityNeeded);
    game.accounts = (game.accounts || []).slice(quantityNeeded);
    game.stock = Math.max(0, (Number(game.stock) || 0) - quantityNeeded);
    await game.save();

    order.status = 'completed';
    order.deliveredData = {
      account: deliveredAccounts.length === 1 ? deliveredAccounts[0] : deliveredAccounts,
      quantity: quantityNeeded,
      deliveredAt: new Date()
    };

    await order.save();

    res.json({ message: 'Order approved and delivered successfully', order });
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
      unitPrice: order.unitPrice,
      totalPrice: order.totalPrice,
      price: order.productId?.price,
      quantity: order.quantity,
      paymentMethod: order.paymentMethod,
      status: order.status,
      deliveredData: order.deliveredData || null,
      username: order.username || order.email?.split('@')[0] || 'مستخدم',
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





