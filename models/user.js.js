const { Schema, model } = require('mongoose');

const userSchema = Schema(
  {
    password: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    subscription: {
      type: String,
      require: true,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: { type: String, require: true, default: null },
    avatarURL: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model('users', userSchema);

module.exports = User;
