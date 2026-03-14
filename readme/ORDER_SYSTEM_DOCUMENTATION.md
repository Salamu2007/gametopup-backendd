# نظام إدارة الطلبات مع MongoDB و Mongoose

## نظرة عامة
تم تحويل نظام الطلبات من التخزين في Array إلى قاعدة بيانات MongoDB مع استخدام Mongoose ORM.

---

## 📋 المتطلبات المثبتة
```json
{
  "mongoose": "^7.0.0 أو أحدث",
  "express": "^4.18.0 أو أحدث",
  "cors": "^2.8.5 أو أحدث"
}
```

### تثبيت المكتبات (إن لم تكن مثبتة)
```bash
npm install mongoose
```

---

## 🏗️ بنية Models

### 1. Game Model (اللعبة)
**ملف:** `backend/models/game.js`

```javascript
{
  _id: ObjectId,
  name: String,
  platform: String,
  price: Number,
  originalPrice: Number,
  image: String,
  stock: Number,
  description: String,
  genre: String,
  rating: Number,
  reviews: Number,
  isNew: Boolean,
  type: String (enum: ['recharge', 'sale']),
  currency: String,
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Order Model (الطلب)
**ملف:** `backend/models/order.js`

```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Game),
  productName: String,
  playerId: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  status: String (enum: ['pending', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Charge Model (الشحن)
**ملف:** `backend/models/charge.js`

```javascript
{
  _id: ObjectId,
  playerId: String,
  amount: Number,
  gameId: ObjectId (ref: Game),
  gameName: String,
  status: String (enum: ['pending', 'completed', 'failed']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 إعدادات MongoDB

### متغير البيئة (Environment Variable)
في ملف `server.js` يتم الربط بـ MongoDB:

```javascript
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gametopup';
await mongoose.connect(mongoUri);
```

### الخيارات:
1. **لـ Local MongoDB:**
   ```
   mongodb://localhost:27017/gametopup
   ```

2. **لـ MongoDB Atlas (Cloud):**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/gametopup
   ```

### تعيين متغير البيئة:
```bash
# Windows (PowerShell)
$env:MONGODB_URI = "mongodb://localhost:27017/gametopup"

# Linux/Mac
export MONGODB_URI="mongodb://localhost:27017/gametopup"
```

---

## 📡 API Endpoints

### 📦 Products Routes

#### الحصول على جميع المنتجات
```
GET /api/products
```

**الاستجابة:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "CyperBunk 2077",
      "price": 129,
      "stock": 12,
      ...
    }
  ]
}
```

#### الحصول على منتج محدد
```
GET /api/products/:id
```

**مثال:**
```
GET /api/products/507f1f77bcf86cd799439011
```

---

### 🛒 Orders Routes

#### إنشاء طلب جديد
```
POST /api/orders
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "playerId": "player123",
  "quantity": 2
}
```

**الاستجابة (نجح):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "productId": "507f1f77bcf86cd799439011",
    "productName": "CyperBunk 2077",
    "playerId": "player123",
    "quantity": 2,
    "unitPrice": 129,
    "totalPrice": 258,
    "status": "pending",
    "createdAt": "2026-02-11T10:30:00.000Z",
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
}
```

**الاستجابة (خطأ في المخزون):**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

#### الحصول على جميع الطلبات
```
GET /api/orders
```

**الاستجابة:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "productId": { ...productData },
      "productName": "CyperBunk 2077",
      "playerId": "player123",
      "quantity": 2,
      "totalPrice": 258,
      "status": "pending",
      "createdAt": "2026-02-11T10:30:00.000Z"
    },
    ...
  ]
}
```

#### الحصول على طلب محدد
```
GET /api/orders/:id
```

**مثال:**
```
GET /api/orders/507f191e810c19729de860ea
```

#### تحديث حالة الطلب
```
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "completed"
}
```

**الحالات المقبولة:** `pending`, `completed`, `cancelled`

**الاستجابة:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "status": "completed",
    "updatedAt": "2026-02-11T10:35:00.000Z",
    ...
  }
}
```

#### حذف/إلغاء طلب
```
DELETE /api/orders/:id
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**ملاحظة:** إذا كان الطلب بحالة `pending`، سيتم استرجاع الكمية إلى مخزون المنتج.

---

### 💰 Charges Routes

#### إنشاء طلب شحن
```
POST /api/charges
Content-Type: application/json

{
  "playerId": "player123",
  "amount": 500,
  "gameId": "507f1f77bcf86cd799439011"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Charge request created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "playerId": "player123",
    "amount": 500,
    "gameId": "507f1f77bcf86cd799439011",
    "gameName": "CyperBunk 2077",
    "status": "pending",
    "createdAt": "2026-02-11T10:30:00.000Z",
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
}
```

#### الحصول على جميع طلبات الشحن
```
GET /api/charges
```

#### الحصول على طلب شحن محدد
```
GET /api/charges/:id
```

#### تحديث حالة طلب الشحن
```
PUT /api/charges/:id
Content-Type: application/json

{
  "status": "completed"
}
```

**الحالات المقبولة:** `pending`, `completed`, `failed`

---

## 🔒 معالجة الأخطاء

جميع الـ Routes تستخدم `try/catch` لمعالجة الأخطاء:

### أمثلة الأخطاء الشائعة:

**1. المنتج غير موجود:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**2. معرّف غير صحيح:**
```json
{
  "success": false,
  "message": "Invalid order ID format"
}
```

**3. خطأ في قاعدة البيانات:**
```json
{
  "success": false,
  "message": "Error creating order",
  "error": "Error message details"
}
```

---

## 🚀 خصائص النظام الجديد

### ✅ المميزات:

1. **Async/Await:** جميع العمليات تستخدم `async/await` للعمليات غير المتزامنة
2. **Try/Catch:** معالجة شاملة للأخطاء
3. **Validation:** التحقق من صحة البيانات قبل الحفظ
4. **Population:** ربط تلقائي للمراجع (References)
5. **Transactions:** إمكانية إنشاء عمليات متعددة آمنة
6. **Timestamps:** `createdAt` و `updatedAt` تلقائياً
7. **Stock Management:** إدارة فعالة للمخزون
8. **Status Tracking:** تتبع حالة الطلبات

### 🔄 تدفق إنشاء الطلب:

```
1. التحقق من البيانات المدخلة
   ↓
2. البحث عن المنتج في DB
   ↓
3. التحقق من توفر المخزون
   ↓
4. حساب السعر الإجمالي
   ↓
5. إنشاء سجل الطلب
   ↓
6. تخفيض المخزون
   ↓
7. حفظ كل التغييرات
   ↓
8. إرجاع الطلب مع بيانات المنتج
```

---

## 📝 أمثلة الاستخدام مع cURL

```bash
# إنشاء طلب جديد
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "playerId": "player123",
    "quantity": 2
  }'

# الحصول على جميع الطلبات
curl http://localhost:3000/api/orders

# الحصول على طلب محدد
curl http://localhost:3000/api/orders/507f191e810c19729de860ea

# تحديث حالة الطلب
curl -X PUT http://localhost:3000/api/orders/507f191e810c19729de860ea \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# حذف الطلب
curl -X DELETE http://localhost:3000/api/orders/507f191e810c19729de860ea
```

---

## ⚠️ ملاحظات مهمة

1. **معرف المنتج:** استخدم `_id` من MongoDB وليس `id`
2. **التحقق من الحالات:** الحالات الصحيحة محددة في `enum`
3. **المخزون:** يتم تخفيضه تلقائياً عند إنشاء الطلب
4. **الحذف:** الطلبات المحذوفة في حالة `pending` تستعيد المخزون
5. **الترتيب:** النتائج مرتبة حسب آخر عملية إنشاء

---

## 🔧 استكشاف الأخطاء الشائعة

### المشكلة: MongoDB connection failed
**الحل:** تأكد من تشغيل MongoDB وأن رابط الاتصال صحيح

### المشكلة: Invalid ID format
**الحل:** استخدم معرف MongoDB الصحيح (24 حرف hex)

### المشكلة: Duplicate key error
**الحل:** قد يكون هناك قيد فريد (unique constraint) - تحقق من المخطط

---

## 📚 موارد إضافية

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)

---

**آخر تحديث:** 11 فبراير 2026
