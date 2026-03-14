# 🎮 نظام إدارة الطلبات - Order Management System

## نظرة عامة

تم تحويل نظام إدارة الطلبات في تطبيق **GameTopUpdz** من استخدام التخزين في الذاكرة (Array) إلى قاعدة بيانات **MongoDB** الاحترافية مع **Mongoose ORM**.

---

## 🎯 الميزات الرئيسية

✅ **Async/Await**: جميع العمليات غير متزامنة وفعالة  
✅ **Error Handling**: معالجة شاملة للأخطاء مع `try/catch`  
✅ **Database Integration**: اتصال موثوق مع MongoDB  
✅ **Stock Management**: إدارة ذكية للمخزون  
✅ **Status Tracking**: تتبع حالة الطلبات  
✅ **Data Validation**: التحقق من صحة البيانات  
✅ **Population**: ربط تلقائي للمراجع  
✅ **Timestamps**: تتبع الوقت تلقائياً  

---

## 📦 المتطلبات

- **Node.js** v14+ 
- **MongoDB** v4.4+ (محلي أو Cloud)
- **npm** أو **yarn**

---

## 🚀 البدء السريع

### 1. التثبيت
```bash
cd backend
npm install
```

### 2. إعداد MongoDB

#### الخيار A: MongoDB محلي
```bash
# إذا أردت استخدام MongoDB محلياً
mongod
```

#### الخيار B: MongoDB Atlas (الموصى به)
1. قم بإنشاء حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ Cluster
3. احصل على رابط الاتصال

### 3. تكوين متغيرات البيئة
```bash
# انسخ `.env.example` إلى `.env`
cp .env.example .env

# عدّل MONGODB_URI حسب إعدادك
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gametopup
```

### 4. تشغيل الـ Server
```bash
# الإنتاج
npm start

# التطوير (مع auto-reload)
npm run dev
```

**الخرج المتوقع:**
```
✅ Server is running on http://localhost:3000
✅ MongoDB connected successfully
✅ Initial products loaded into database
```

---

## 📡 هيكل API

### المنتجات (Products)
```
GET    /api/products          - الحصول على جميع المنتجات
GET    /api/products/:id      - الحصول على منتج محدد
```

### الطلبات (Orders)
```
POST   /api/orders            - إنشاء طلب جديد
GET    /api/orders            - الحصول على جميع الطلبات
GET    /api/orders/:id        - الحصول على طلب محدد
PUT    /api/orders/:id        - تحديث حالة الطلب
DELETE /api/orders/:id        - حذف/إلغاء الطلب
```

### الشحن (Charges)
```
POST   /api/charges           - إنشاء طلب شحن
GET    /api/charges           - الحصول على جميع طلبات الشحن
GET    /api/charges/:id       - الحصول على طلب شحن محدد
PUT    /api/charges/:id       - تحديث حالة طلب الشحن
```

---

## 📝 أمثلة الاستخدام

### إنشاء طلب
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "playerId": "player123",
    "quantity": 2
  }'
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "productId": "507f1f77bcf86cd799439011",
    "productName": "CyberPunk 2077",
    "playerId": "player123",
    "quantity": 2,
    "unitPrice": 129,
    "totalPrice": 258,
    "status": "pending"
  }
}
```

### الحصول على الطلبات
```bash
curl http://localhost:3000/api/orders
```

### تحديث الحالة
```bash
curl -X PUT http://localhost:3000/api/orders/507f191e810c19729de860ea \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## 🗂️ هيكل المشروع

```
backend/
├── models/
│   ├── game.js           # منموذج اللعبة
│   ├── order.js          # منموذج الطلب
│   └── charge.js         # منموذج الشحن
├── routes/
│   ├── order.js          # مسارات الطلبات
│   └── topup.js          # مسارات الشحن
├── server.js             # ملف الخادم الرئيسي
├── examples.js           # أمثلة عملية
├── package.json          # المكتبات المطلوبة
├── .env.example          # مثال لمتغيرات البيئة
├── ORDER_SYSTEM_DOCUMENTATION.md  # توثيق شامل
└── TESTING_GUIDE.md      # دليل الاختبار
```

---

## 🔄 تدفق إنشاء الطلب

```
1️⃣  التحقق من صحة البيانات
     ↓
2️⃣  البحث عن المنتج في قاعدة البيانات
     ↓
3️⃣  التحقق من توفر المخزون
     ↓
4️⃣  حساب السعر الإجمالي
     ↓
5️⃣  إنشاء سجل الطلب
     ↓
6️⃣  تخفيض كمية المخزون
     ↓
7️⃣  حفظ جميع التغييرات في قاعدة البيانات
     ↓
8️⃣  إرجاع بيانات الطلب الكاملة
```

---

## 📊 حالات الطلبات

| الحالة | الوصف | الرمز |
|--------|-------|------|
| `pending` | قيد الانتظار | ⏳ |
| `completed` | مكتمل | ✅ |
| `cancelled` | ملغي | ❌ |

---

## 🛡️ معالجة الأخطاء

### أمثلة الأخطاء الشائعة:

**1. منتج غير موجود (404)**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**2. مخزون غير كافي (400)**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

**3. معرف غير صحيح (400)**
```json
{
  "success": false,
  "message": "Invalid order ID format"
}
```

**4. خطأ في الخادم (500)**
```json
{
  "success": false,
  "message": "Error creating order",
  "error": "...details..."
}
```

---

## 🧪 الاختبار

### اختبار يدوي باستخدام Postman
- انظر [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### تشغيل الأمثلة الحية
```bash
node backend/examples.js
```

---

## 🔧 الخيارات المتقدمة

### إضافة المزيد من الحقول في الطلب

**تعديل Order Model:**
```javascript
const orderSchema = new mongoose.Schema({
  // الحقول الموجودة...
  
  shippingAddress: String,
  paymentMethod: String,
  notes: String
}, { timestamps: true });
```

### إضافة التحقق من البريد الإلكتروني

```javascript
const orderSchema = new mongoose.Schema({
  // ...
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/
  }
}, { timestamps: true });
```

### إضافة الفهرسة للأداء

```javascript
orderSchema.index({ playerId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
```

---

## 📚 الموارد والمراجع

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/security/)
- [Express.js Guide](https://expressjs.com/)
- [RESTful API Design](https://restfulapi.net/)

---

## 🐛 استكشاف الأخطاء الشائعة

### ❌ MongoDB connection failed
**الحل:** تأكد من:
- تشغيل MongoDB
- صحة رابط الاتصال في `.env`
- الاتصال بالإنترنت (إذا كنت تستخدم MongoDB Atlas)

### ❌ Cannot find module 'mongoose'
**الحل:**
```bash
npm install mongoose
# أو
npm install --save mongoose
```

### ❌ Port 3000 already in use
**الحل:**
```bash
# غير الـ PORT في .env
PORT=3001
```

### ❌ Duplicate key error
**الحل:** تحقق من أن معرفات المنتجات صحيحة وموجودة في قاعدة البيانات

---

## 📞 الدعم

في حالة حدوث أي مشاكل:

1. اقرأ [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. اقرأ [ORDER_SYSTEM_DOCUMENTATION.md](./ORDER_SYSTEM_DOCUMENTATION.md)
3. تحقق من سجلات الخادم (Server Logs)
4. استخدم MongoDB Compass لفحص البيانات

---

## ✅ قائمة التحقق

قبل النشر على الإنتاج:

- [ ] تم اختبار جميع المسارات
- [ ] تم اختبار معالجة الأخطاء
- [ ] تم التحقق من الأمان (CORS, Input Validation)
- [ ] تم فحص الأداء (Indexes, Query Optimization)
- [ ] تم إعداد متغيرات البيئة بشكل صحيح
- [ ] تم عمل Backup لقاعدة البيانات
- [ ] تم التحقق من سجلات الأخطاء

---

## 📄 الترخيص

ISC

---

**آخر تحديث:** 11 فبراير 2026

**الإصدار:** 2.0.0 (MongoDB Migration)

🎉 **شكراً لاستخدام نظام إدارة الطلبات!**
