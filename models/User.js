const mongoose = require("mongoose");
const TokenSchema = require("./Tokens").TokenSchema;

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, default: null},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date_naissance: { type: Date },
    sexe: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    unlockAt: { type: Date },
    tokens: { type: TokenSchema, default: null },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
