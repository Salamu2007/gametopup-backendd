# 📖 دليل شامل: نظام إدارة الطلبات مع MongoDB

## 🎯 مقدمة

تم تطوير نظام متكامل لإدارة طلبات الألعاب والشحن في تطبيق **GameTopUpdz**. هذا النظام يستخدم **MongoDB** كقاعدة بيانات و **Mongoose** كـ ORM.

---

## 📚 الملفات التوثيقية

### للبدء السريع:
1. **[QUICK_START.md](./QUICK_START.md)** - ابدأ من هنا! ⭐
   - 4 خطوات فقط للبدء
   - معالجة الأخطاء الشائعة

### للفهم العميق:
2. **[README.md](./README.md)** - نظرة عامة شاملة
   - المميزات الرئيسية
   - هيكل المشروع
   - الاستخدام الأساسي

3. **[ORDER_SYSTEM_DOCUMENTATION.md](./ORDER_SYSTEM_DOCUMENTATION.md)** - التوثيق الكامل
   - شرح كل Model
   - جميع الـ Endpoints
   - أمثلة استفصادية مفصلة

### للاختبار:
4. **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - دليل اختبار شامل
   - خطوات التشغيل تفصيلاً
   - سيناريوهات اختبار كاملة
   - استكشاف الأخطاء

### للمطورين:
5. **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - ملخص التغييرات
   - كل التحسينات التي تمت
   - الملفات الجديدة
   - المميزات الجديدة

6. **[BEFORE_AFTER_COMPARISON.md](./BEFORE_AFTER_COMPARISON.md)** - المقارنة
   - النظام القديم vs الجديد
   - بالكود الفعلي
   - الفروقات الرئيسية

---

## 🗂️ هيكل الكود

```
backend/
│
├── 📁 models/          # نماذج قاعدة البيانات
│   ├── game.js        # منموذج اللعبة/المنتج
│   ├── order.js       # منموذج الطلب
│   └── charge.js      # منموذج الشحن
│
├── 📁 routes/         # المسارات وـ API Endpoints
│   ├── order.js       # مسارات الطلبات (Orders)
│   └── topup.js       # مسارات الشحن (Charges)
│
├── 📄 server.js       # ملف الخادم الرئيسي
├── 📄 examples.js     # أمثلة عملية للاستخدام
│
├── 🔧 package.json    # المكتبات والإعدادات
├── 📋 .env.example    # مثال لمتغيرات البيئة
│
└── 📚 Documentation/
    ├── README.md
    ├── QUICK_START.md
    ├── ORDER_SYSTEM_DOCUMENTATION.md
    ├── TESTING_GUIDE.md
    ├── MIGRATION_SUMMARY.md
    ├── BEFORE_AFTER_COMPARISON.md
    └── COMPREHENSIVE_GUIDE.md (هذا الملف)
```

---

## 🚀 خطوات التطبيق

### الخطوة 1: التثبيت والإعداد
```bash
# 1. انتقل إلى مجلد backend
cd backend

# 2. ثبّت المكتبات
npm install

# 3. أنشئ ملف .env
cp .env.example .env

# 4. عدّل MONGODB_URI في .env
```

### الخطوة 2: إعداد MongoDB
**الخيار A - Local:**
```bash
# شغّل MongoDB
mongod
```

**الخيار B - Cloud (MongoDB Atlas):**
1. سجل على: https://www.mongodb.com/cloud/atlas
2. أنشئ Cluster
3. احصل على URI
4. ضعه في .env

### الخطوة 3: تشغيل السيرفر
```bash
# التطوير (مع Auto-reload)
npm run dev

# أو الإنتاج
npm start
```

### الخطوة 4: الاختبار
```bash
# استخدم Postman أو cURL
curl http://localhost:3000/api/products
```

---

## 📡 الـ API بالكامل

### Products (المنتجات)

#### الحصول على جميع المنتجات
```
GET /api/products
```
**الاستجابة:** مصفوفة بجميع المنتجات المتاحة

#### الحصول على منتج محدد
```
GET /api/products/:id
```
**المثال:**
```
GET /api/products/507f1f77bcf86cd799439011
```

---

### Orders (الطلبات)

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
    "productName": "CyberPunk 2077",
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

#### الحصول على جميع الطلبات
```
GET /api/orders
```

#### الحصول على طلب محدد
```
GET /api/orders/:id
```

#### تحديث حالة الطلب
```
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "completed"
}
```

**الحالات المقبولة:**
- `pending` - قيد الانتظار
- `completed` - مكتمل
- `cancelled` - ملغي

#### حذف الطلب
```
DELETE /api/orders/:id
```

---

### Charges (الشحن)

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

#### الحصول على جميع طلبات الشحن
```
GET /api/charges
```

#### الحصول على طلب شحن محدد
```
GET /api/charges/:id
```

#### تحديث حالة الشحن
```
PUT /api/charges/:id
Content-Type: application/json

{
  "status": "completed"
}
```

**الحالات المقبولة:**
- `pending` - قيد الانتظار
- `completed` - مكتمل
- `failed` - فشل

---

## 💾 قاعدة البيانات

### Collections in MongoDB

#### Collections
1. **games** - المنتجات/الألعاب
2. **orders** - الطلبات
3. **charges** - طلبات الشحن

### Game Document مثال
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "CyberPunk 2077",
  "platform": "PC",
  "price": 129,
  "originalPrice": 179,
  "stock": 12,
  "description": "نسخة أصلية للـ PC",
  "genre": "أكشن",
  "rating": 4.8,
  "reviews": 324,
  "isNew": true,
  "createdAt": ISODate("2026-02-11T10:00:00.000Z"),
  "updatedAt": ISODate("2026-02-11T10:00:00.000Z")
}
```

### Order Document مثال
```json
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "productId": ObjectId("507f1f77bcf86cd799439011"),
  "productName": "CyberPunk 2077",
  "playerId": "player123",
  "quantity": 2,
  "unitPrice": 129,
  "totalPrice": 258,
  "status": "pending",
  "createdAt": ISODate("2026-02-11T10:30:00.000Z"),
  "updatedAt": ISODate("2026-02-11T10:30:00.000Z")
}
```

---

## 🔒 الأمان والتحقق

### Validation على مستوى Schema
```javascript
const orderSchema = new Schema({
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  productId: { type: ObjectId, ref: 'Game', required: true }
});
```

### Validation على مستوى API
```javascript
if (!productId || !playerId || !quantity) {
  return res.status(400).json({ message: 'Missing required fields' });
}
```

### Error Handling
```javascript
try {
  // العملية
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error', error: error.message });
}
```

---

## 🧪 أمثلة اختبار عملية

### مثال 1: سيناريو كامل

```javascript
// 1. الحصول على المنتجات
GET /api/products

// نسخ _id من أول منتج بمخزون > 0

// 2. إنشاء طلب
POST /api/orders
Body: {
  "productId": "[PRODUCT_ID]",
  "playerId": "testPlayer",
  "quantity": 1
}

// نسخ _id من الاستجابة

// 3. الحصول على الطلب
GET /api/orders/[ORDER_ID]

// 4. تحديث الحالة
PUT /api/orders/[ORDER_ID]
Body: { "status": "completed" }

// 5. الحصول على الطلب المحدث
GET /api/orders/[ORDER_ID]

// التحقق: المنتج يجب أن تقل كميته
GET /api/products/[PRODUCT_ID]
```

### مثال 2: اختبار الأخطاء

```javascript
// 1. منتج غير موجود
POST /api/orders
Body: {
  "productId": "invalidid",
  "playerId": "test",
  "quantity": 1
}
// Expected: 404 Not Found

// 2. مخزون غير كافي
POST /api/orders
Body: {
  "productId": "[PRODUCT_ID]",
  "playerId": "test",
  "quantity": 10000
}
// Expected: 400 Insufficient stock
```

---

## 🛠️ الإعدادات المتقدمة

### إضافة Indexes للأداء
```javascript
// في models/order.js
orderSchema.index({ playerId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
```

### إضافة Hooks (Middleware)
```javascript
orderSchema.pre('save', function(next) {
  console.log('Saving order:', this._id);
  next();
});
```

### إضافة Methods مخصصة
```javascript
orderSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};
```

### إضافة Statics
```javascript
orderSchema.statics.findByPlayerId = function(playerId) {
  return this.find({ playerId });
};
```

---

## 📊 مراقبة قاعدة البيانات

### استخدام MongoDB Compass
1. تنزيل [MongoDB Compass](https://www.mongodb.com/products/compass)
2. الاتصال برابط MongoDB
3. استعراض Collections والبيانات
4. تنفيذ queries مباشرة

### Useful Queries
```javascript
// تعداد جميع الطلبات
db.orders.countDocuments()

// الطلبات المعلقة فقط
db.orders.find({ status: 'pending' })

// طلبات لاعب معين
db.orders.find({ playerId: 'player123' })

// إجمالي المبيعات
db.orders.aggregate([
  { $group: { _id: null, total: { $sum: '$totalPrice' } } }
])
```

---

## 🐛 استكشاف الأخطاء الشائعة

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017

✅ الحل:
- تأكد من تشغيل mongod
- تحقق من رابط الاتصال في .env
- إذا كنت تستخدم Atlas، تحقق من الاتصال بالإنترنت
```

### Invalid ID Format
```
Error: Invalid order ID format

✅ الحل:
- استخدم _id من MongoDB (24 حرف hex)
- لا تستخدم id عادي
```

### Duplicate Key Error
```
Error: E11000 duplicate key error

✅ الحل:
- تحقق من unique constraints
- امسح البيانات القديمة إذا لزم الأمر
```

### Population Not Working
```
// undefined population

✅ الحل:
- تأكد من أن ref في Schema صحيح
- تأكد من وجود الوثيقة المرجعية
- استخدم await مع populate
```

---

## 📈 نصائح الأداء

### 1. استخدم Indexes
```javascript
schema.index({ status: 1 });
schema.index({ playerId: 1, createdAt: -1 });
```

### 2. استخدم Pagination
```javascript
const limit = 10;
const skip = (page - 1) * limit;
const orders = await Order.find().skip(skip).limit(limit);
```

### 3. قلل البيانات المُرجعة
```javascript
// استرجاع حقول محددة فقط
const orders = await Order.find().select('_id playerId status');
```

### 4. استخدم Caching
```javascript
// تخزين مؤقت للنتائج الشائعة
const cache = new Map();
```

---

## 🎓 أفضل الممارسات

✅ **افعل:**
- استخدم async/await دائماً
- تحقق من صحة البيانات
- استخدم try/catch
- سجل الأخطاء
- استخدم Indexes
- اكتب تعليقات واضحة

❌ **لا تفعل:**
- لا تستخدم Callbacks
- لا تتجاهل الأخطاء
- لا تخزن بيانات حساسة في الكود
- لا تعيد رسائل خطأ مفصلة جداً للعميل
- لا تنسَ التحقق من الصلاحيات

---

## 📚 موارد إضافية

- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Express Guide](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 🎯 الخطوات التالية

1. ✅ اقرأ QUICK_START.md
2. ✅ شغّل السيرفر
3. ✅ اختبر الـ API
4. ✅ اقرأ TESTING_GUIDE.md
5. ✅ أضف ميزات جديدة حسب الحاجة
6. ✅ انشر على الإنتاج بأمان

---

**نسخة:** 2.0.0  
**التاريخ:** 11 فبراير 2026  
**الحالة:** ✅ مكتمل وجاهز للإنتاج

🎉 **شكراً لاستخدام النظام!**
