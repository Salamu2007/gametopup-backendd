import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  price: {  
    type: Number,
    required: true,
    min: 0
  }
});

const gameSchema = new mongoose.Schema({
  name: {
      type:String,
      required: true,
      index: true
  },
  currency: {
      type:String,
      required: true,
      default: '0'
  },
  image: String,
  package: [packageSchema],
  category: {
      type:String,
      required: true,
      index: true
  },
  platform: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    min: 0,
    required: function() { return this.type === 'game'; }
  },
  originalPrice: Number,
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  description: String,
  genre: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  is_New: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['game', 'charge'],
    required: true
  }
}, { 
  timestamps: true 
});

const Game = mongoose.model('Game', gameSchema);
export default Game;



