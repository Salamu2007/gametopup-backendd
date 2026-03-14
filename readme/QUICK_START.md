# 🚀 البدء السريع (Quick Start)

## خطوات التشغيل الفورية

### 1️⃣ التثبيت (30 ثانية)
```bash
cd backend
npm install
```

### 2️⃣ إعداد MongoDB

#### الخيار A: Local MongoDB
```bash
# تنزيل MongoDB من: https://www.mongodb.com/try/download/community
# تشغيل MongoDB
mongod

# في terminal جديد، تابع الخطوات التالية
```

#### الخيار B: MongoDB Atlas (الموصى به)
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. أنشئ عنقود (Cluster)
3. اسحب رابط الاتصال

### 3️⃣ إعداد متغيرات البيئة
```bash
# انسخ الملف
cp .env.example .env

# عدّل MONGODB_URI في .env
# MONGODB_URI=mongodb://localhost:27017/gametopup
# أو
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gametopup
```

### 4️⃣ تشغيل السيرفر
```bash
npm start
```

**ستشاهد:**
```
✅ Server is running on http://localhost:3000
✅ MongoDB connected successfully
✅ Initial products loaded into database
```

---

## 🧪 اختبار فوري

### باستخدام cURL

```bash
# 1. الحصول على المنتجات
curl http://localhost:3000/api/products

# 2. انسخ _id من أول منتج

# 3. إنشاء طلب (استبدل PRODUCT_ID)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "playerId": "testPlayer",
    "quantity": 1
  }'

# 4. الحصول على الطلبات
curl http://localhost:3000/api/orders
```

### أو استخدم Postman

1. افتح Postman
2. أنشئ طلب جديد:
   - Method: `POST`
   - URL: `http://localhost:3000/api/orders`
   - Body (JSON):
   ```json
   {
     "productId": "PRODUCT_ID",
     "playerId": "testPlayer",
     "quantity": 1
   }
   ```
3. اضغط Send

---

## 📚 الملفات المهمة

```
backend/
├── README.md                           ← اقرأ أولاً
├── ORDER_SYSTEM_DOCUMENTATION.md       ← الدليل الكامل
├── TESTING_GUIDE.md                    ← كيفية الاختبار
├── MIGRATION_SUMMARY.md                ← ملخص التغييرات
├── BEFORE_AFTER_COMPARISON.md          ← المقارنة
├── QUICK_START.md                      ← هذا الملف
├── .env.example                        ← إعدادات البيئة
├── examples.js                         ← أمثلة عملية
├── server.js                           ← الخادم الرئيسي
├── models/
│   ├── game.js
│   ├── order.js
│   └── charge.js
└── routes/
    ├── order.js
    └── topup.js
```

---

## 🔍 معالجة المشاكل الشائعة

### ❌ خطأ: Cannot find module 'mongoose'
```bash
npm install mongoose
```

### ❌ خطأ: MongoDB connection failed
1. تأكد من تشغيل MongoDB
2. تحقق من MONGODB_URI في .env
3. تحقق من الاتصال بالإنترنت (إذا كنت تستخدم Atlas)

### ❌ خطأ: Port 3000 already in use
```bash
# غير الـ PORT في .env
PORT=3001
```

### ❌ خطأ: Invalid product ID
استخدم `_id` من استجابة منتج (ليس `id`)

---

## ✅ قائمة التحقق

- [ ] MongoDB مُشغّل
- [ ] npm install تم
- [ ] .env معد بشكل صحيح
- [ ] npm start يعمل
- [ ] `http://localhost:3000/api/products` يعيد بيانات
- [ ] يمكن إنشاء طلب جديد
- [ ] يمكن الحصول على الطلبات

---

## 📞 المساعدة

**أسئلة شائعة؟** اقرأ:
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - للاختبار
- [ORDER_SYSTEM_DOCUMENTATION.md](./ORDER_SYSTEM_DOCUMENTATION.md) - للـ API
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - للتغييرات

---

## 🎯 الخطوات التالية الموصى بها

1. ✅ اقرأ README.md
2. ✅ شغّل السيرفر
3. ✅ جرّب الأمثلة
4. ✅ اقرأ TESTING_GUIDE.md
5. ✅ جرّب مع Postman
6. ✅ اقرأ ORDER_SYSTEM_DOCUMENTATION.md
7. ✅ استكشف الكود

---

**ستارت الآن! 🚀**
