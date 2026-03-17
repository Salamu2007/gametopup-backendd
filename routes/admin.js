import express from 'express';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
import Order from '../models/order.js';
import Charge from '../models/charge.js';
import Game from '../models/game.js';
dotenv.config();



const router = express.Router();

// Helper to build full URL (useful for images stored locally)
const getBaseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

// Create a new admin
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {username, password} = req.body;
    try {
        const existingAdmin = await Admin.findOne({username});
        if (existingAdmin) {
            return res.status(400).json({message: 'Username already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({username, password: hashedPassword});
        await newAdmin.save();
        res.status(201).json({message: 'Admin registered successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
});

// Admin login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {username, password} = req.body;
    try {
        const admin = await Admin.findOne({username});
        if (!admin) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({adminId: admin._id}, process.env.JWT_SECRET, {expiresIn: '2h'});
        res.json({token});
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
});

// routes/admin.js

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCharges = await Charge.countDocuments();
    const totalGames = await Game.countDocuments();

    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalCharges,
      totalGames,
      latestOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('productId', 'name') // اسم اللعبة وصورتها
      .sort({ createdAt: -1 })
      .limit(10); // آخر 10 طلبات

    // نفرغ البيانات اللازمة للإرسال للداشبورد
    const foundorders = orders.map(o => ({
      _id: o._id,
      gameName: o.productId?.name,
      gameImage: o.productId?.image
        ? (o.productId.image.startsWith('/uploads/')
            ? `${getBaseUrl(req)}${o.productId.image}`
            : o.productId.image)
        : '/assets/images/default.png',
      currency: o.productId?.currency || 'دج',
      paymentImage: o.proofImageUrl || o.proofIImageUrl || null,
      email: o.email,
      quantity: o.quantity,
      status: o.status,
      createdAt: o.createdAt
    }));

    res.json(foundorders); // تشوف البيانات في الكونصول
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/charges', authMiddleware, async (req, res) => {
  try {
    const charges = await Charge.find()
      .populate('gameId', 'name image currency') // اسم اللعبة وصورتها والعملة
      .sort({ createdAt: -1 })
      .limit(10); // آخر 10 شحنات

    // نفرغ البيانات اللازمة للإرسال للداشبورد
    const foundcharges = charges.map(c => {
      return {
        _id: c._id,
        gameName: c.gameId?.name,
        gameImage: c.gameId?.image
          ? (c.gameId.image.startsWith('/uploads/')
              ? `${getBaseUrl(req)}${c.gameId.image}`
              : c.gameId.image)
          : '/assets/images/default.png',
        currency: c.gameId?.currency || 'دج',
        paymentImage: c.proofImageUrl || null,
        email: c.email,
        quantity: c.quantity || 0, // Default to 0 if not set
        playerId: c.playerId,
        status: c.status,
        createdAt: c.createdAt
      };
    });

    res.json(foundcharges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/confirm/:id', authMiddleware, async (req, res) => {
  try {
    
    const order = await Order.findById(req.params.id).populate('productId', 'name');;
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = "paid";

    await order.save();

    // email notification
    if (order.email) {
      try {
        const gmailUser = process.env.GMAIL_USER?.trim();
        const gmailPass = process.env.GMAIL_PASS?.trim();
        if (!gmailUser || !gmailPass) {
          console.warn('⚠️ Gmail credentials are not set. Please set GMAIL_USER and GMAIL_PASS in your environment.');
        }
        if (gmailUser && gmailPass) {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({ service:'gmail', auth:{user:gmailUser,pass:gmailPass}});
          await transporter.sendMail({
            from: gmailUser,
            to: order.email,
            subject: '✅ طلب الشراء مقبول',
            html: `
            <div style="direction: rtl; font-family: Arial, sans-serif; color: #333;">
              <h2>🎉 تم قبول طلب الشراء!</h2>
              <p>تهانينا، لقد تم قبول طلب شراء اللعبة بنجاح.</p>
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>تفاصيل الطلب:</strong></p>
                <p>🎮 <strong>اللعبة:</strong> ${order.productId?.name || 'Unknown'}</p>
                <p>👤 <strong>بريدك الالكتروني :</strong> ${order.email}</p>
                <p>💰 <strong>المبلغ:</strong> ${order.totalPrice} دج</p>
                <p>📦 <strong>الكمية:</strong> ${order.quantity || 0}</p>
                <p>🆔 <strong>رقم الطلب:</strong> ${order._id}</p>
              </div>
              <p>سيتم إعلامك عبر البريد الإلكتروني بمجرد اكتمال العملية.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
              <p style="font-size: 12px; color: #999;">شكراً لثقتك بنا.</p>
            </div>
          `
          });
        }
      } catch(e){ console.error('email notify order confirm fail', e.message); }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = "rejected";
    await order.save();

    if (order.email) {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS?.replace(/\s/g, '');
        if (gmailUser && gmailPass) {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({ service:'gmail', auth:{user:gmailUser,pass:gmailPass}});
          await transporter.sendMail({
            from: gmailUser,
            to: order.email,
            subject: '❌ طلب الشراء مرفوض',
            html: `
            <div style="direction: rtl; font-family: Arial, sans-serif; color: #333;">
              <h2>⚠️ تم رفض طلب الشراء</h2>
              <p>نأسف لإبلاغك أنّ طلب شراء اللعبة تم رفضه.</p>
              <p>سيتم إعلامك بالبريد الإلكتروني حال اكتمال الإجراء أو وجود تحديث.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
              <p style="font-size: 12px; color: #999;">نقدر صبرك وتفهّمك.</p>
            </div>
          `
          });
        }
      } catch(e){ console.error('email notify order reject fail', e.message); }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/confirm-charge/:id', authMiddleware, async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id).populate('gameId', 'name');
    if (!charge) return res.status(404).json({ message: 'Charge not found' });

    charge.status = "paid";
    await charge.save();

    // إرسال إشعار بريدي للمستخدم
    if (charge.email) {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS?.replace(/\s/g, ''); // إزالة جميع المسافات

        if (!gmailUser || !gmailPass) {
          console.warn('⚠️ بيانات Gmail غير مكتملة');
        } else {
          const nodemailer = await import('nodemailer');
          
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailPass
            }
          });

          const mailOptions = {
            from: gmailUser,
            to: charge.email,
            subject: '✅ طلب الشحن مقبول',
            html: `
              <div style="direction: rtl; font-family: Arial, sans-serif; color: #333;">
                <h2>🎉 تم قبول طلب الشحن!</h2>
                <p>طلبك قُبل بنجاح، وسيتم إعلامك عند اكتمال العملية أو صدور أي تحديث.</p>
                
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p><strong>تفاصيل الطلب:</strong></p>
                  <p>🎮 <strong>اللعبة:</strong> ${charge.gameId?.name || 'Unknown'}</p>
                  <p>👤 <strong>معرف اللاعب:</strong> ${charge.playerId}</p>
                  <p>💰 <strong>المبلغ:</strong> ${charge.amount} دج</p>
                  <p>📦 <strong>الكمية:</strong> ${charge.quantity || 0}</p>
                  <p>🆔 <strong>رقم الطلب:</strong> ${charge._id}</p>
                </div>
                
                <p style="color: #555;">سيتم إضافة الشحن إلى حسابك في غضون دقائق معدودة.</p>
                <p style="color: #555;">شكراً لك على استخدام خدمتنا! 🙏</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">هذا البريد تم إرساله تلقائياً. يرجى عدم الرد عليه.</p>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
        }
      } catch (mailErr) {
        console.error('❌ فشل إرسال البريد:', mailErr.message);
      }
    }

    res.json(charge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/reject-charge/:id', authMiddleware, async (req, res) => {
  try {
    const charge = await Charge.findById(req.params.id).populate('gameId','name');
    if (!charge) return res.status(404).json({ message: 'Charge not found' });

    charge.status = "rejected";
    await charge.save();

    // notify user via email if available
    if (charge.email) {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS?.replace(/\s/g, '');
        if (gmailUser && gmailPass) {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({ service: 'gmail', auth:{user:gmailUser,pass:gmailPass} });
          await transporter.sendMail({
            from: gmailUser,
            to: charge.email,
            subject: '❌ تم رفض طلب الشحن',
            html: `
              <div style="direction: rtl; font-family: Arial, sans-serif; color: #333;">
                <h2>عذراً! ❌</h2>
                <p>لقد تم رفض طلب الشحن الخاص بك للعبة <strong>${charge.gameId?.name||'Unknown'}</strong>.</p>
                <p>سوف نُعلمك مرة أخرى عند اكتمال أي خطوات أو إذا ظهرت معلومات جديدة.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                <p style="font-size: 12px; color: #999;">شكراً لتفهّمك ونتمنى لك تجربة أفضل.</p>
              </div>
            `
          });
        }
      } catch(e){ console.error('email notify failed',e.message); }
    }

    res.json(charge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
