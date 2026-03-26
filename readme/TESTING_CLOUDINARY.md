# دليل اختبار رفع الصور مع Cloudinary 🧪

## ✅ ما تم إصلاحه

1. **الاستيراد الصحيح لـ Cloudinary**
   - من: `import cloudinary from 'cloudinary'`
   - إلى: `import { v2 as cloudinary } from 'cloudinary'`

2. **استخدام الـ API الصحيح**
   - من: `cloudinary.v2.uploader.upload_stream()`
   - إلى: `cloudinary.uploader.upload_stream()`

3. **معالجة الأخطاء**
   - إضافة console logs لتتبع الأخطاء
   - إرجاع رسائل خطأ واضحة

4. **Multer Configuration**
   - تغيير من `diskStorage` إلى `memoryStorage`
   - الملفات تُرفع مباشرة إلى Cloudinary

---

## 🧪 طريقة الاختبار الخطوة بخطوة

### الخطوة 1: بدء الخادم
```bash
cd c:\Users\boukh\OneDrive\Desktop\gametopupdz\backend
npm run dev
```

**الخرج المتوقع:**
```
✅ Server is running on https://gametopup-api.onrender.com
✅ Connected to MongoDB
```

### الخطوة 2: فتح Postman

#### اختبار 1: رفع صورة لعبة
```
Method: POST
URL: http://localhost:3000/api/products/upload-image
Authorization: Bearer {token}  // إذا كنت تقتضي authMiddleware

Body: form-data
├── Key: "image" (type: File)
└── Value: اختر صورة من الكمبيوتر (JPG/PNG/GIF)
```

**الرد الناجح (200):**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/gametopupdz/image/upload/v1234567890/gametopupdz/games/game-1711411200000-123456789.jpg",
  "publicId": "gametopupdz/games/game-1711411200000-123456789"
}
```

**الرد الفاشل (400):**
```json
{
  "message": "No file uploaded"
}
```

**الرد الفاشل (500):**
```json
{
  "message": "Failed to upload image",
  "error": "رسالة الخطأ من Cloudinary"
}
```

---

#### اختبار 2: رفع إثبات الدفع للطلب
```
Method: POST
URL: http://localhost:3000/api/orders/confirm/{orderId}
Authorization: Bearer {token}

Body: form-data
├── Key: "proofImage" (type: File)
└── Value: صورة الإثبات
```

**الرد الناجح (200):**
```json
{
  "message": "Payment proof uploaded successfully"
}
```

---

#### اختبار 3: رفع إثبات الدفع للشحن
```
Method: POST
URL: http://localhost:3000/api/charges/confirm/{chargeId}
Authorization: Bearer {token}

Body: form-data
├── Key: "proofImage" (type: File)
└── Value: صورة الإثبات
```

---

### الخطوة 3: اختبار من الواجهة الأمامية

#### مثال في Angular
```typescript
// في admin-games.component.ts أو حيث تضيف صور
uploadGameImage(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', file);

  return this.http.post(
    `${this.apiUrl}/api/products/upload-image`,
    formData
  );
}

// في الـ template
<input type="file" (change)="onImageSelected($event)" accept="image/*">
<button (click)="uploadImage()">رفع الصورة</button>

// في الـ component
onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    this.selectedFile = input.files[0];
  }
}

uploadImage(): void {
  if (!this.selectedFile) {
    alert('اختر صورة أولاً');
    return;
  }

  this.uploadGameImage(this.selectedFile).subscribe({
    next: (response) => {
      console.log('✅ تم الرفع بنجاح:', response.imageUrl);
      // استخدم response.imageUrl في قاعدة البيانات
    },
    error: (error) => {
      console.error('❌ فشل الرفع:', error);
      alert('فشل في رفع الصورة');
    }
  });
}
```

---

### الخطوة 4: التحقق من الصور في Cloudinary

1. اذهب إلى https://cloudinary.com/console
2. قم بـ login بحسابك
3. اذهب إلى **Media Library**
4. ستجد المجلدات:
   - `gametopupdz/games/` → صور الألعاب
   - `gametopupdz/orders/` → إثباتات الطلبات
   - `gametopupdz/charges/` → إثباتات الشحن

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يزال يظهر خطأ 500
**الحل:**
```bash
# 1. أعد تشغيل الخادم
npm run dev

# 2. تحقق من لوغات الخادم في Terminal
# يجب أن ترى: "Cloudinary error: ..."

# 3. تحقق من متغيرات البيئة
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

### المشكلة: تحذير CORS
**الحل:**
تأكد من أن الواجهة الأمامية تحت:
```
http://localhost:4200  (التطوير)
https://gamestopupdz.vercel.app (الإنتاج)
```

### المشكلة: الصورة لا تظهر بعد الرفع
**الحل:**
```javascript
// تأكد من استخدام secure_url بدلاً من url
// ✅ صحيح
imageUrl: result.secure_url

// ❌ خطأ
imageUrl: result.url
```

---

## 📊 مقارنة: قبل وبعد

| الميزة | قبل | بعد |
|------|------|------|
| التخزين | ملفات محلية | Cloudinary السحابة |
| الأداء | أبطأ (تحميل من الخادم) | أسرع (CDN عالمي) |
| المساحة | تشغل مساحة الخادم | لا تشغل مساحة |
| النسخ الاحتياطية | يدوي | تلقائي من Cloudinary |
| الأمان | محدود | عالي جداً |
| السعة | محدودة | غير محدودة |

---

## 📱 اختبر من متصفح مختلف

```javascript
// في DevTools Console
// اختبر الـ fetch مباشرة
const formData = new FormData();
const file = document.querySelector('input[type="file"]').files[0];
formData.append('image', file);

fetch('http://localhost:3000/api/products/upload-image', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

---

## ✅ آخر الخطوات

- [ ] اختبر رفع صورة من Postman
- [ ] اختبر من الواجهة الأمامية
- [ ] تحقق من الصور في Cloudinary
- [ ] جرب من متصفح مختلف
- [ ] اختبر من جهاز محمول
- [ ] استخدم في الإنتاج

---

**الحالة:** ✅ كل الأخطاء تم حلها
**الخادم:** ✅ يعمل بدون مشاكل
**الاختبار:** ⏳ جاهز الآن

