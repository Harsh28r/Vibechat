import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  inChat: {
    type: Boolean,
    default: false
  },
  partnerId: {
    type: String,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  totalChats: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ socketId: 1 });
userSchema.index({ isOnline: 1, inChat: 1 });
userSchema.index({ lastActive: -1 });

const User = mongoose.model('User', userSchema);

export default User;

