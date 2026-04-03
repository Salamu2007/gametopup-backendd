import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ["ccp", "baridimob"],
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
  dynamicData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  phone:{
    type:String, 
    required:true   },
  quantity: {
    type: Number,
    required: false
  },
  proofImageUrl: {
    type: String,
    required: false  },
}, 
{ 
  timestamps: true 
});

export default mongoose.model('Charge', chargeSchema);
