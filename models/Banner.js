import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  linkUrl: {
    type: String,
    trim: true,
    default: ''
  },
  ctaText: {
    type: String,
    trim: true,
    default: 'عرض الآن'
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BannerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Banner', BannerSchema);
