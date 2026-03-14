import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ["ccp", "baridimob", "card"],
  },

  status: {
    type: String,
    enum: ["pending", "waiting_verification", "paid", "rejected"],
    default: "pending",
    index: true
  },
  email:{
    type:String,
    required:true
  },
  phone:{
    type:String, 
    required:true 
  },
  // proof image uploaded by user during payment, accessible via URL
  proofImageUrl: String,
  // keep old field in case some documents used it
  proofIImageUrl:String,
}, 
{ 
  timestamps: true 
});

export default mongoose.model('Order', orderSchema);
