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
  gender: {
    type: String,
    default: 'other'
  },
  interests: {
    type: [String],
    default: []
  },
  preferences: {
    gender: {
      type: String,
      default: 'any'
    },
    country: {
      type: String,
      default: 'ANY'
    }
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

