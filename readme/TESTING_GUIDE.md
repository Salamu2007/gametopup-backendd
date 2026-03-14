# دليل الاختبار - Order Management System

## 🔧 الأدوات المطلوبة

- **Postman** أو **Thunder Client** أو **REST Client**
- **MongoDB** (محلي أو cloud)
- **Node.js** مع `npm`

---

## 📦 خطوات التشغيل

### 1. تثبيت المكتبات
```bash
cd backend
npm install
```

### 2. إعداد MongoDB
#### الخيار A: MongoDB محلي
```bash
# تثبيت MongoDB (إن لم يكن مثبتاً)
# ثم بدء الخدمة
mongod
```

#### الخيار B: MongoDB Atlas (Cloud)
1. قم بإنشاء حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. انسخ رابط الاتصال
3. أنشئ ملف `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gametopup
PORT=3000
```

### 3. بدء الـ Server
```bash
node server.js
```

**الخرج المتوقع:**
```
✅ Server is running on http://localhost:3000
✅ MongoDB connected successfully
✅ Initial products loaded into database
📚 API Documentation:
...
```

---

## 🧪 اختبار الـ API

### 1️⃣ الحصول على المنتجات

**Request:**
```http
GET http://localhost:3000/api/products
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "CyberPunk 2077",
      "price": 129,
      "stock": 12,
      "platform": "PC",
      "image": "/assets/images/cyperbank2077.png"
    }
  ]
}
```

---

### 2️⃣ إنشاء طلب

**Request:**
```http
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "playerId": "player123",
  "quantity": 2
}
```

**Response (201 Created):**
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

---

### 3️⃣ الحصول على جميع الطلبات

**Request:**
```http
GET http://localhost:3000/api/orders
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f191e810c19729de860ea",
      "productId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "CyberPunk 2077",
        "price": 129,
        "stock": 10
      },
      "productName": "CyberPunk 2077",
      "playerId": "player123",
      "quantity": 2,
      "unitPrice": 129,
      "totalPrice": 258,
      "status": "pending",
      "createdAt": "2026-02-11T10:30:00.000Z"
    }
  ]
}
```

---

### 4️⃣ الحصول على طلب محدد

**Request:**
```http
GET http://localhost:3000/api/orders/507f191e810c19729de860ea
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "productId": { ... },
    "productName": "CyberPunk 2077",
    "playerId": "player123",
    "quantity": 2,
    "totalPrice": 258,
    "status": "pending"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 5️⃣ تحديث حالة الطلب

**Request:**
```http
PUT http://localhost:3000/api/orders/507f191e810c19729de860ea
Content-Type: application/json

{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "status": "completed",
    "updatedAt": "2026-02-11T10:35:00.000Z"
  }
}
```

**Valid Statuses:**
- `pending` - قيد الانتظار
- `completed` - مكتمل
- `cancelled` - ملغي

---

### 6️⃣ حذف الطلب

**Request:**
```http
DELETE http://localhost:3000/api/orders/507f191e810c19729de860ea
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

### 7️⃣ إنشاء طلب شحن

**Request:**
```http
POST http://localhost:3000/api/charges
Content-Type: application/json

{
  "playerId": "player123",
  "amount": 500,
  "gameId": "507f1f77bcf86cd799439011"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Charge request created successfully",
  "data": {
    "_id": "507f191e810c19729de860ea",
    "playerId": "player123",
    "amount": 500,
    "gameId": "507f1f77bcf86cd799439011",
    "gameName": "CyberPunk 2077",
    "status": "pending"
  }
}
```

---

## 🧪 اختبار متقدم

### اختبار سيناريو كامل

```javascript
// 1. الحصول على أول منتج
GET /api/products

// Copy the _id من الاستجابة

// 2. إنشاء طلب
POST /api/orders
Body: {
  "productId": "[PRODUCT_ID_FROM_STEP_1]",
  "playerId": "testPlayer",
  "quantity": 1
}

// Copy the _id من الاستجابة

// 3. التحقق من الطلب
GET /api/orders/[ORDER_ID_FROM_STEP_2]

// 4. تحديث الحالة
PUT /api/orders/[ORDER_ID_FROM_STEP_2]
Body: { "status": "completed" }

// 5. التحقق من التحديث
GET /api/orders/[ORDER_ID_FROM_STEP_2]

// 6. المنتج يجب أن تقل كميته بـ 1
GET /api/products/[PRODUCT_ID_FROM_STEP_1]
// تحقق من أن stock قل بـ 1
```

---

## 📊 اختبار الأخطاء

### خطأ 1: منتج غير موجود
```http
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "invalidid123456789012345",
  "playerId": "player123",
  "quantity": 1
}
```

**Expected:** 404 Not Found

---

### خطأ 2: مخزون غير كافي
```http
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "playerId": "player123",
  "quantity": 1000
}
```

**Expected:** 400 Bad Request - "Insufficient stock"

---

### خطأ 3: معرف غير صحيح
```http
GET http://localhost:3000/api/orders/invalid-id
```

**Expected:** 400 Bad Request - "Invalid order ID format"

---

## 🔄 سيناريو اختبار شامل

### السيناريو: عملية شراء كاملة

1. **عرض المنتجات المتاحة**
   - احصل على جميع المنتجات
   - اختر منتج بمخزون > 0

2. **إنشاء الطلب**
   - أرسل طلب شراء
   - تحقق من خفض المخزون

3. **تتبع الطلب**
   - احصل على الطلب بـ ID
   - تحقق من جميع البيانات

4. **معالجة الطلب**
   - غير الحالة إلى `completed`
   - تحقق من التحديث الزمني

5. **إلغاء الطلب**
   - أنشئ طلب جديد آخر
   - احذفه
   - تحقق من استرجاع المخزون

---

## 📝 ملاحظات الاختبار

✅ **ما يجب التحقق منه:**
- [ ] المخزون ينخفض بعد الطلب
- [ ] حالة الطلب تتحدث بشكل صحيح
- [ ] أوقات الإنشاء والتحديث صحيحة
- [ ] الأخطاء معالجة بشكل صحيح
- [ ] الرد يحتوي على جميع البيانات المطلوبة
- [ ] معرف MongoDB صحيح (_id)
- [ ] الـ References تعمل (population)

---

## 🐛 استكشاف الأخطاء

### Problem: "Cannot set headers after they are sent"
**Solution:** تأكد من وجود `return` قبل كل `res.json()`

### Problem: Duplicate key error
**Solution:** تحقق من عدم وجود قيود فريدة (unique keys) غير متوقعة

### Problem: Null population
**Solution:** تأكد من أن `ref` في Schema صحيح والمستند موجود

---

## 📚 أوامر Curl المفيدة

```bash
# إنشاء طلب
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"507f1f77bcf86cd799439011","playerId":"test","quantity":1}'

# الحصول على الطلبات
curl http://localhost:3000/api/orders

# تحديث الطلب
curl -X PUT http://localhost:3000/api/orders/ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# حذف الطلب
curl -X DELETE http://localhost:3000/api/orders/ID
```

---

**جاهز للاختبار! 🚀**
