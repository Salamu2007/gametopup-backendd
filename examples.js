/**
 * نماذج عملية لاستخدام Order API
 * قم بتشغيل هذا الملف بعد بدء الـ Server
 * 
 * الاستخدام: node backend/examples/order-examples.js
 */

const BASE_URL = 'http://localhost:3000/api';

// ==================== HELPER FUNCTIONS ====================

/**
 * دالة مساعدة لإرسال الطلبات (Requests)
 */
async function apiRequest(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`❌ Error in ${method} ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

// ==================== EXAMPLE FUNCTIONS ====================

/**
 * 1️⃣ الحصول على جميع المنتجات
 */
async function getAllProducts() {
  console.log('\n========== 1️⃣ GET ALL PRODUCTS ==========');
  const result = await apiRequest('GET', '/products');
  
  if (result.data.success) {
    console.log(`✅ تم الحصول على ${result.data.count} منتج`);
    result.data.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   السعر: $${product.price}`);
      console.log(`   المخزون: ${product.stock}`);
    });
    return result.data.data;
  } else {
    console.log('❌', result.data.message);
  }
}

/**
 * 2️⃣ إنشاء طلب جديد
 */
async function createOrder(productId, playerId, quantity) {
  console.log('\n========== 2️⃣ CREATE NEW ORDER ==========');
  const body = {
    productId,
    playerId,
    quantity
  };

  console.log(`📝 طلب جديد:`);
  console.log(`   Player ID: ${playerId}`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   الكمية: ${quantity}`);

  const result = await apiRequest('POST', '/orders', body);

  if (result.data.success) {
    console.log('✅ تم إنشاء الطلب بنجاح');
    const order = result.data.data;
    console.log(`   Order ID: ${order._id}`);
    console.log(`   المنتج: ${order.productName}`);
    console.log(`   السعر الإجمالي: $${order.totalPrice}`);
    console.log(`   الحالة: ${order.status}`);
    return order;
  } else {
    console.log('❌ خطأ:', result.data.message);
    return null;
  }
}

/**
 * 3️⃣ الحصول على جميع الطلبات
 */
async function getAllOrders() {
  console.log('\n========== 3️⃣ GET ALL ORDERS ==========');
  const result = await apiRequest('GET', '/orders');

  if (result.data.success) {
    console.log(`✅ عدد الطلبات: ${result.data.count}`);
    result.data.data.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ID: ${order._id}`);
      console.log(`   المنتج: ${order.productName}`);
      console.log(`   الكمية: ${order.quantity}`);
      console.log(`   السعر الكلي: $${order.totalPrice}`);
      console.log(`   الحالة: ${order.status}`);
      console.log(`   تاريخ الإنشاء: ${new Date(order.createdAt).toLocaleDateString('ar-SA')}`);
    });
    return result.data.data;
  } else {
    console.log('❌', result.data.message);
  }
}

/**
 * 4️⃣ الحصول على طلب محدد
 */
async function getOrderById(orderId) {
  console.log('\n========== 4️⃣ GET ORDER BY ID ==========');
  console.log(`🔍 البحث عن الطلب: ${orderId}`);

  const result = await apiRequest('GET', `/orders/${orderId}`);

  if (result.data.success) {
    console.log('✅ تم العثور على الطلب');
    const order = result.data.data;
    console.log(`   Order ID: ${order._id}`);
    console.log(`   المنتج: ${order.productName}`);
    console.log(`   Player: ${order.playerId}`);
    console.log(`   الكمية: ${order.quantity}`);
    console.log(`   السعر الكلي: $${order.totalPrice}`);
    console.log(`   الحالة: ${order.status}`);
    return order;
  } else {
    console.log('❌', result.data.message);
    return null;
  }
}

/**
 * 5️⃣ تحديث حالة الطلب
 */
async function updateOrderStatus(orderId, newStatus) {
  console.log('\n========== 5️⃣ UPDATE ORDER STATUS ==========');
  const body = { status: newStatus };

  console.log(`🔄 تحديث حالة الطلب: ${orderId}`);
  console.log(`   الحالة الجديدة: ${newStatus}`);

  const result = await apiRequest('PUT', `/orders/${orderId}`, body);

  if (result.data.success) {
    console.log('✅ تم التحديث بنجاح');
    const order = result.data.data;
    console.log(`   المنتج: ${order.productName}`);
    console.log(`   الحالة: ${order.status}`);
    console.log(`   آخر تحديث: ${new Date(order.updatedAt).toLocaleString('ar-SA')}`);
    return order;
  } else {
    console.log('❌ خطأ:', result.data.message);
    return null;
  }
}

/**
 * 6️⃣ حذف/إلغاء طلب
 */
async function deleteOrder(orderId) {
  console.log('\n========== 6️⃣ DELETE ORDER ==========');
  console.log(`🗑️ حذف الطلب: ${orderId}`);

  const result = await apiRequest('DELETE', `/orders/${orderId}`);

  if (result.data.success) {
    console.log('✅ تم حذف الطلب بنجاح (والمخزون تم استرجاعه إن كان pending)');
    return true;
  } else {
    console.log('❌ خطأ:', result.data.message);
    return false;
  }
}

/**
 * 7️⃣ إنشاء عدة طلبات بتتابع
 */
async function createMultipleOrders(products) {
  console.log('\n========== 7️⃣ CREATE MULTIPLE ORDERS ==========');
  const orders = [];

  for (const { productId, quantity } of products) {
    const playerId = `player_${Math.floor(Math.random() * 10000)}`;
    const order = await createOrder(productId, playerId, quantity);
    
    if (order) {
      orders.push(order);
      // تأخير صغير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n📊 ملخص: تم إنشاء ${orders.length} طلب بنجاح`);
  return orders;
}

// ==================== MAIN EXECUTION ====================

/**
 * تشغيل جميع الأمثلة
 */
async function runAllExamples() {
  console.log('🚀 بدء تشغيل الأمثلة...\n');
  console.log('═══════════════════════════════════════════');

  try {
    // الحصول على المنتجات أولاً
    const products = await getAllProducts();
    
    if (!products || products.length === 0) {
      console.log('❌ لا توجد منتجات متاحة');
      return;
    }

    // استخدام أول منتج متوفر في المخزون
    const availableProduct = products.find(p => p.stock > 0);
    if (!availableProduct) {
      console.log('❌ لا توجد منتجات متوفرة في المخزون');
      return;
    }

    // إنشاء طلب جديد
    const newOrder = await createOrder(
      availableProduct._id,
      'testPlayer123',
      2
    );

    if (!newOrder) return;

    // الحصول على جميع الطلبات
    await getAllOrders();

    // الحصول على الطلب المحدد
    await getOrderById(newOrder._id);

    // تحديث الحالة إلى completed
    await updateOrderStatus(newOrder._id, 'completed');

    // الحصول على الطلبات مرة أخرى لرؤية التحديث
    await getAllOrders();

    // إنشاء عدة طلبات إضافية
    const multiOrders = await createMultipleOrders([
      { productId: availableProduct._id, quantity: 1 },
      { productId: products[1]?._id, quantity: 1 }
    ].filter(o => o.productId));

    // الحصول على الرصيد النهائي
    await getAllOrders();

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ انتهت جميع الأمثلة بنجاح!');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  }
}

// ==================== CHARGE EXAMPLES ====================

/**
 * مثال على إنشاء طلب شحن
 */
async function createChargeExample(gameId, playerId, amount) {
  console.log('\n========== ⚡ CREATE CHARGE ==========');
  const body = {
    gameId,
    playerId,
    amount
  };

  const result = await apiRequest('POST', '/charges', body);

  if (result.data.success) {
    console.log('✅ تم إنشاء طلب الشحن بنجاح');
    const charge = result.data.data;
    console.log(`   Charge ID: ${charge._id}`);
    console.log(`   المبلغ: ${charge.amount}`);
    console.log(`   اللعبة: ${charge.gameName}`);
    console.log(`   الحالة: ${charge.status}`);
    return charge;
  } else {
    console.log('❌ خطأ:', result.data.message);
    return null;
  }
}

// تشغيل الأمثلة عند استدعاء الملف مباشرة
if (require.main === module) {
  runAllExamples();
  
  // تشغيل مثال الشحن بعد ثواني قليلة
  setTimeout(() => {
    console.log('\n\n');
  }, 5000);
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  createChargeExample,
  getAllProducts
};
